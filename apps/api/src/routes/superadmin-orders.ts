import { and, desc, eq, ne, or } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db/client";
import { orderItems } from "../db/schema/order-items";
import { orderStatusEnum, orders } from "../db/schema/orders";
import { products } from "../db/schema/products";
import { logActivity } from "../lib/activity-logs";
import { requireAuth } from "../middleware/require-auth";
import type { Variables } from "../types/context";

const superadminOrdersRoutes = new Hono<{ Variables: Variables }>();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// GET /search — superadmin only. Finds an order by its ID (UUID) or its
// 6-character order code, scoped to the tenant.
superadminOrdersRoutes.get("/search", requireAuth(["superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");
  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  const q = c.req.query("q")?.trim();
  if (!q) {
    return c.json({ error: "A search query is required" }, 400);
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(q);

  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.tenantId, tenantId),
        isUuid ? eq(orders.id, q) : eq(orders.orderCode, q.toUpperCase()),
      ),
    )
    .limit(1);

  if (!order) {
    return c.json({ error: "No order found for that ID or code" }, 404);
  }

  const items = await db
    .select({
      id: orderItems.id,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      productName: products.name,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, order.id));

  return c.json({ order, items });
});

// GET /flagged — superadmin only. Orders where status/paymentStatus look
// inconsistent — e.g. marked completed/confirmed but still unpaid, the
// clearest signal something needs manual review.
superadminOrdersRoutes.get("/flagged", requireAuth(["superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");
  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  const flagged = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.tenantId, tenantId),
        eq(orders.paymentStatus, "unpaid"),
        or(eq(orders.status, "confirmed"), eq(orders.status, "completed")),
      ),
    )
    .orderBy(desc(orders.createdAt));

  return c.json(flagged);
});

// GET /:id/verify-payment — superadmin only. Calls Paystack's verify endpoint
// using the order's own ID as the reference (this is what /checkout/pay sends
// as the reference at initialization), and compares Paystack's real status
// against what's currently recorded in the database. Read-only — makes no
// changes, just surfaces the comparison for the superadmin to review.
superadminOrdersRoutes.get(
  "/:id/verify-payment",
  requireAuth(["superadmin"]),
  async (c) => {
    const tenantId = c.get("tenantId");
    if (!tenantId) {
      return c.json({ error: "No tenant associated with this account" }, 400);
    }

    if (!PAYSTACK_SECRET_KEY) {
      return c.json({ error: "Payment verification is not configured" }, 500);
    }

    const id = c.req.param("id") as string;

    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, id), eq(orders.tenantId, tenantId)))
      .limit(1);

    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    const res = await fetch(`https://api.paystack.co/transaction/verify/${order.id}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });

    const data = await res.json();

    if (!data.status) {
      // Paystack has no record of this reference at all — most likely
      // payment was never initiated for this order (checkout abandoned
      // before reaching Paystack), a legitimate and distinguishable result.
      return c.json({
        found: false,
        dbPaymentStatus: order.paymentStatus,
        paystackStatus: null,
        amountMatches: null,
        canApplyCorrection: false,
      });
    }

    const paystackStatus = data.data.status as string;
    const expectedAmountInPesewas = Math.round(Number(order.totalAmount) * 100);
    const amountMatches = data.data.amount === expectedAmountInPesewas;

    const canApplyCorrection =
      paystackStatus === "success" && amountMatches && order.paymentStatus !== "paid";

    return c.json({
      found: true,
      dbPaymentStatus: order.paymentStatus,
      paystackStatus,
      paidAt: data.data.paid_at,
      amountMatches,
      paidAmount: data.data.amount,
      expectedAmount: expectedAmountInPesewas,
      canApplyCorrection,
    });
  },
);

// PATCH /:id/apply-payment-correction — superadmin only. Marks an order as
// paid, but ONLY after re-verifying with Paystack itself in this same
// request (never trusts a client-supplied "it's confirmed, just mark it") —
// closes the loop so this can't be used to force-mark unpaid orders as paid.
superadminOrdersRoutes.patch(
  "/:id/apply-payment-correction",
  requireAuth(["superadmin"]),
  async (c) => {
    const tenantId = c.get("tenantId");
    if (!tenantId) {
      return c.json({ error: "No tenant associated with this account" }, 400);
    }

    if (!PAYSTACK_SECRET_KEY) {
      return c.json({ error: "Payment verification is not configured" }, 500);
    }

    const id = c.req.param("id") as string;
    const actor = c.get("user")!;

    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, id), eq(orders.tenantId, tenantId)))
      .limit(1);

    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    if (order.paymentStatus === "paid") {
      return c.json({ error: "This order is already marked as paid" }, 400);
    }

    const res = await fetch(`https://api.paystack.co/transaction/verify/${order.id}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });
    const data = await res.json();

    if (!data.status || data.data.status !== "success") {
      return c.json(
        { error: "Paystack does not confirm this payment as successful. No changes made." },
        400,
      );
    }

    const expectedAmountInPesewas = Math.round(Number(order.totalAmount) * 100);
    if (data.data.amount !== expectedAmountInPesewas) {
      return c.json(
        { error: "Paid amount does not match the order total. No changes made." },
        400,
      );
    }

    const [updated] = await db
      .update(orders)
      .set({ paymentStatus: "paid", status: "confirmed", updatedAt: new Date() })
      .where(and(eq(orders.id, id), eq(orders.tenantId, tenantId)))
      .returning();

    await logActivity({
      tenantId,
      actorId: actor.id,
      actorName: actor.name ?? actor.email,
      action: "payment.manually_reconciled",
      targetType: "order",
      targetId: id,
      details: `Manually reconciled payment for order after Paystack verification confirmed success`,
    });

    return c.json(updated);
  },
);

const updateStatusSchema = z.object({
  status: z.enum(orderStatusEnum.enumValues),
});

// PATCH /:id/status — superadmin only. Manual status override, same
// mechanics as the admin route in orders.ts, kept separate here so this
// file's access boundary is self-contained.
superadminOrdersRoutes.patch("/:id/status", requireAuth(["superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");
  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  const actor = c.get("user")!;
  const id = c.req.param("id") as string;
  const body = await c.req.json();
  const parsed = updateStatusSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const [existing] = await db
    .select({ status: orders.status })
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.tenantId, tenantId)))
    .limit(1);

  if (!existing) {
    return c.json({ error: "Order not found" }, 404);
  }

  const [updated] = await db
    .update(orders)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(and(eq(orders.id, id), eq(orders.tenantId, tenantId)))
    .returning();

  if (parsed.data.status !== existing.status) {
    await logActivity({
      tenantId,
      actorId: actor.id,
      actorName: actor.name ?? actor.email,
      action: "order.status_changed",
      targetType: "order",
      targetId: id,
      details: `[Superadmin] Changed order status from "${existing.status}" to "${parsed.data.status}"`,
    });
  }

  return c.json(updated);
});

export default superadminOrdersRoutes;
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db/client";
import { orderItems } from "../db/schema/order-items";
import { orders } from "../db/schema/orders";
import { products } from "../db/schema/products";
import { returns, type ReturnItem } from "../db/schema/returns";
import { logActivity } from "../lib/activity-logs";
import { requireAuth } from "../middleware/require-auth";
import type { Variables } from "../types/context";

const returnsRoutes = new Hono<{ Variables: Variables }>();

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID;

const lookupOrderSchema = z.object({
  orderCode: z.string().trim().min(1, "Order code is required"),
  phone: z.string().trim().min(1, "Phone number is required"),
});

// POST /lookup — public. Finds an order by order code + phone, for the
// customer return-request flow. Returns limited info: enough to build the
// return form, not the full internal order record.
returnsRoutes.post("/lookup", async (c) => {
  if (!DEFAULT_TENANT_ID) {
    return c.json({ error: "Server misconfigured: missing DEFAULT_TENANT_ID" }, 500);
  }

  const body = await c.req.json();
  const parsed = lookupOrderSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.tenantId, DEFAULT_TENANT_ID),
        eq(orders.orderCode, parsed.data.orderCode.toUpperCase()),
        eq(orders.contactPhone, parsed.data.phone),
      ),
    )
    .limit(1);

  if (!order) {
    return c.json(
      { error: "No order found matching that order code and phone number." },
      404,
    );
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

  // Any existing return requests for this order, so the customer (and the
  // lookup form) can see if items were already returned/requested before.
  const existingReturns = await db
    .select()
    .from(returns)
    .where(eq(returns.orderId, order.id));

  return c.json({
    order: {
      id: order.id,
      orderCode: order.orderCode,
      createdAt: order.createdAt,
      status: order.status,
      totalAmount: order.totalAmount,
      deliveryFee: order.deliveryFee,
    },
    items,
    existingReturns,
  });
});

const returnItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1),
  reason: z.string().trim().max(500).optional(),
});

const createReturnSchema = z.object({
  orderId: z.string().uuid(),
  orderCode: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  items: z.array(returnItemSchema).min(1, "Select at least one item to return"),
  paystackReference: z.string().trim().optional(),
  notes: z.string().trim().max(1000).optional(),
});

// POST / — public. Customer submits a return request. Re-verifies the
// order code + phone match (never trusts the orderId alone from the
// client) and validates each item/quantity actually belongs to the order.
returnsRoutes.post("/", async (c) => {
  if (!DEFAULT_TENANT_ID) {
    return c.json({ error: "Server misconfigured: missing DEFAULT_TENANT_ID" }, 500);
  }

  const body = await c.req.json();
  const parsed = createReturnSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.id, parsed.data.orderId),
        eq(orders.tenantId, DEFAULT_TENANT_ID),
        eq(orders.orderCode, parsed.data.orderCode.toUpperCase()),
        eq(orders.contactPhone, parsed.data.phone),
      ),
    )
    .limit(1);

  if (!order) {
    return c.json({ error: "Order details do not match. Please check and try again." }, 404);
  }

  const orderItemRows = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  const orderItemByProduct = new Map(orderItemRows.map((oi) => [oi.productId, oi]));

  for (const item of parsed.data.items) {
    const orderItem = orderItemByProduct.get(item.productId);
    if (!orderItem) {
      return c.json({ error: "One of the selected items is not part of this order." }, 400);
    }
    if (item.quantity > orderItem.quantity) {
      return c.json(
        { error: "Cannot return more than the quantity originally ordered." },
        400,
      );
    }
  }

  const returnItems: ReturnItem[] = parsed.data.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    reason: item.reason ?? null,
  }));

  const [created] = await db
    .insert(returns)
    .values({
      tenantId: DEFAULT_TENANT_ID,
      orderId: order.id,
      items: returnItems,
      requestedBy: "customer",
      status: "requested",
      paystackReference: parsed.data.paystackReference,
      notes: parsed.data.notes,
    })
    .returning();

  return c.json(created, 201);
});

// GET / — admin/superadmin only. Lists all return requests for the tenant,
// most recent first.
returnsRoutes.get("/", requireAuth(["admin", "superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");
  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  const results = await db
    .select()
    .from(returns)
    .where(eq(returns.tenantId, tenantId))
    .orderBy(desc(returns.createdAt));

  return c.json(results);
});

// GET /:id — admin/superadmin only. Full detail on one return, including
// the parent order and product names for the returned items.
returnsRoutes.get("/:id", requireAuth(["admin", "superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");
  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  const id = c.req.param("id") as string;

  const [returnRecord] = await db
    .select()
    .from(returns)
    .where(and(eq(returns.id, id), eq(returns.tenantId, tenantId)))
    .limit(1);

  if (!returnRecord) {
    return c.json({ error: "Return not found" }, 404);
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, returnRecord.orderId))
    .limit(1);

  const productIds = returnRecord.items.map((i) => i.productId);
  const productRows =
    productIds.length > 0
      ? await db.select().from(products).where(eq(products.tenantId, tenantId))
      : [];
  const productById = new Map(productRows.map((p) => [p.id, p]));

  const itemsWithNames = returnRecord.items.map((item) => ({
    ...item,
    productName: productById.get(item.productId)?.name ?? "Unknown product",
  }));

  return c.json({ return: returnRecord, order, items: itemsWithNames });
});

const updateStatusSchema = z.object({
  status: z.enum(["item_received", "approved", "rejected", "refunded"]),
  refundAmount: z.coerce.number().min(0).optional(),
  includeDeliveryFee: z.boolean().optional(),
  notes: z.string().trim().max(1000).optional(),
});

// PATCH /:id/status — admin/superadmin only. Moves a return through its
// lifecycle. refundAmount/includeDeliveryFee are admin-set, never
// auto-computed — matches the locked manual-refund design.
returnsRoutes.patch("/:id/status", requireAuth(["admin", "superadmin"]), async (c) => {
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
    .select()
    .from(returns)
    .where(and(eq(returns.id, id), eq(returns.tenantId, tenantId)))
    .limit(1);

  if (!existing) {
    return c.json({ error: "Return not found" }, 404);
  }

  if (existing.status === "refunded" || existing.status === "rejected") {
    return c.json({ error: "This return has already been finalized." }, 400);
  }

  if (parsed.data.status === "refunded" && existing.status !== "approved") {
    return c.json({ error: "A return must be approved before it can be marked refunded." }, 400);
  }

  const [updated] = await db
    .update(returns)
    .set({
      status: parsed.data.status,
      refundAmount:
        parsed.data.refundAmount !== undefined ? String(parsed.data.refundAmount) : undefined,
      includeDeliveryFee: parsed.data.includeDeliveryFee,
      notes: parsed.data.notes ?? existing.notes,
      processedAt: new Date(),
      processedBy: actor.id,
    })
    .where(and(eq(returns.id, id), eq(returns.tenantId, tenantId)))
    .returning();

  await logActivity({
    tenantId,
    actorId: actor.id,
    actorName: actor.name ?? actor.email,
    action: "return.status_changed",
    targetType: "return",
    targetId: id,
    details: `Changed return status from "${existing.status}" to "${parsed.data.status}"`,
  });

  return c.json(updated);
});

// POST /:id/restore-inventory — admin/superadmin only. One-click "restore
// to inventory" for a return's items — a manual trigger, not automatic,
// per the locked design.
returnsRoutes.post(
  "/:id/restore-inventory",
  requireAuth(["admin", "superadmin"]),
  async (c) => {
    const tenantId = c.get("tenantId");
    if (!tenantId) {
      return c.json({ error: "No tenant associated with this account" }, 400);
    }

    const actor = c.get("user")!;
    const id = c.req.param("id") as string;

    const [returnRecord] = await db
      .select()
      .from(returns)
      .where(and(eq(returns.id, id), eq(returns.tenantId, tenantId)))
      .limit(1);

    if (!returnRecord) {
      return c.json({ error: "Return not found" }, 404);
    }

    for (const item of returnRecord.items) {
      const [product] = await db
        .select({ id: products.id, stock: products.stock })
        .from(products)
        .where(and(eq(products.id, item.productId), eq(products.tenantId, tenantId)))
        .limit(1);

      if (product) {
        await db
          .update(products)
          .set({ stock: product.stock + item.quantity, updatedAt: new Date() })
          .where(eq(products.id, product.id));
      }
    }

    await logActivity({
      tenantId,
      actorId: actor.id,
      actorName: actor.name ?? actor.email,
      action: "return.inventory_restored",
      targetType: "return",
      targetId: id,
      details: `Restored ${returnRecord.items.reduce((sum, i) => sum + i.quantity, 0)} item(s) to inventory`,
    });

    return c.json({ success: true });
  },
);

export default returnsRoutes;
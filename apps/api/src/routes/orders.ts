import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db/client";
import { orderItems } from "../db/schema/order-items";
import { orderStatusEnum, orders } from "../db/schema/orders";
import { products } from "../db/schema/products";
import { requireAuth } from "../middleware/require-auth";
import type { Variables } from "../types/context";

const ordersRoutes = new Hono<{ Variables: Variables }>();

const updateStatusSchema = z.object({
  status: z.enum(orderStatusEnum.enumValues),
});

// GET / — admin/superadmin only. Lists orders for the tenant, optionally filtered
// by status and/or channel, most recent first.
ordersRoutes.get("/", requireAuth(["admin", "superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");
  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }
  const status = c.req.query("status");
  const channel = c.req.query("channel");
  const conditions = [eq(orders.tenantId, tenantId)];
  if (status) conditions.push(eq(orders.status, status as (typeof orderStatusEnum.enumValues)[number]));
  if (channel) conditions.push(eq(orders.channel, channel as "online" | "in_store"));
  const results = await db
    .select()
    .from(orders)
    .where(and(...conditions))
    .orderBy(desc(orders.createdAt));
  return c.json(results);
});

// GET /confirmation/:id — public. Returns limited order info for the post-checkout
// confirmation page. Registered BEFORE /:id so "confirmation" is never matched as an id.
// No auth check: a guest checking out has no session to prove ownership, so this relies
// on the order ID (a UUID) being unguessable rather than credential-based access control.
ordersRoutes.get("/confirmation/:id", async (c) => {
  const id = c.req.param("id") as string;

  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);

  if (!order) {
    return c.json({ error: "Order not found" }, 404);
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
    .where(eq(orderItems.orderId, id));

  return c.json({ order, items });
});

// GET /:id — admin/superadmin only. Returns one order with its line items
// (joined with product names, since a product could later be renamed/deleted).
ordersRoutes.get("/:id", requireAuth(["admin", "superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");
  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
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
    .where(eq(orderItems.orderId, id));
  return c.json({ order, items });
});

// PATCH /:id/status — admin/superadmin only. Updates order status
// (includes "cancelled" as the stand-in for returns/refunds for now).
ordersRoutes.patch("/:id/status", requireAuth(["admin", "superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");
  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }
  const id = c.req.param("id") as string;
  const body = await c.req.json();
  const parsed = updateStatusSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  const [updated] = await db
    .update(orders)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(and(eq(orders.id, id), eq(orders.tenantId, tenantId)))
    .returning();
  if (!updated) {
    return c.json({ error: "Order not found" }, 404);
  }
  return c.json(updated);
});

export default ordersRoutes;
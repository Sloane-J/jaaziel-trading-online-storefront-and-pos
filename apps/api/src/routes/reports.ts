import { and, asc, eq, gte, lte, ne } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db/client";
import { categories } from "../db/schema/categories";
import { orderItems } from "../db/schema/order-items";
import { orders } from "../db/schema/orders";
import { products } from "../db/schema/products";
import { requireAuth } from "../middleware/require-auth";
import type { Variables } from "../types/context";

const reportsRoutes = new Hono<{ Variables: Variables }>();

const DAYS = 15;

// GET /sales-by-category — admin/superadmin. Daily sales totals for the last 15 days,
// one series per category, excluding cancelled orders.
reportsRoutes.get("/sales-by-category", requireAuth(["admin", "superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");
  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  const since = new Date();
  since.setDate(since.getDate() - (DAYS - 1));
  since.setHours(0, 0, 0, 0);

  const rows = await db
    .select({
      createdAt: orders.createdAt,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      categoryName: categories.name,
    })
    .from(orders)
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(eq(orders.tenantId, tenantId), ne(orders.status, "cancelled"), gte(orders.createdAt, since)),
    );

  // Build one row per day, with each category as its own key — the shape
  // recharts wants for a multi-line chart: [{ date, "Phones": 120, "Cars": 0, ... }, ...]
  const categoryNames = new Set<string>();
  const dayMap = new Map<string, Record<string, number> & { date: string }>();

  for (let i = 0; i < DAYS; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dayMap.set(key, { date: key });
  }

  for (const row of rows) {
    const key = new Date(row.createdAt).toISOString().slice(0, 10);
    const bucket = dayMap.get(key);
    if (!bucket) continue;

    categoryNames.add(row.categoryName);
    const lineTotal = Number(row.unitPrice) * row.quantity;
    bucket[row.categoryName] = (bucket[row.categoryName] ?? 0) + lineTotal;
  }

  // Ensure every day has a 0 entry for every category seen in the range,
  // so each line renders continuously instead of having gaps.
  const days = Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  for (const day of days) {
    for (const name of categoryNames) {
      if (!(name in day)) day[name] = 0;
    }
  }

  return c.json({ days, categories: Array.from(categoryNames) });
});

// GET /low-stock — admin/superadmin. Active products at or below a threshold, lowest first.
reportsRoutes.get("/low-stock", requireAuth(["admin", "superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");
  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  const threshold = Number(c.req.query("threshold") ?? 5);

  const lowStockProducts = await db
    .select()
    .from(products)
    .where(and(eq(products.tenantId, tenantId), eq(products.isActive, true), lte(products.stock, threshold)))
    .orderBy(asc(products.stock));

  return c.json(lowStockProducts);
});

// GET /today-summary — admin/superadmin. Today's revenue and order count.
reportsRoutes.get("/today-summary", requireAuth(["admin", "superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");
  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todaysOrders = await db
    .select()
    .from(orders)
    .where(
      and(eq(orders.tenantId, tenantId), ne(orders.status, "cancelled"), gte(orders.createdAt, startOfDay)),
    );

  const revenue = todaysOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

  return c.json({ revenue, orderCount: todaysOrders.length });
});

// GET /overview-stats — admin/superadmin. Gross sales (all-time), today's sales and
// order count with day-over-day trend, and low-stock count.
reportsRoutes.get("/overview-stats", requireAuth(["admin", "superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");
  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const [allOrders, lowStockProducts] = await Promise.all([
    db
      .select()
      .from(orders)
      .where(and(eq(orders.tenantId, tenantId), ne(orders.status, "cancelled"))),
    db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.tenantId, tenantId), eq(products.isActive, true), lte(products.stock, 5))),
  ]);

  const grossSales = allOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const todaysOrders = allOrders.filter((o) => new Date(o.createdAt) >= startOfToday);
  const yesterdaysOrders = allOrders.filter(
    (o) => new Date(o.createdAt) >= startOfYesterday && new Date(o.createdAt) < startOfToday,
  );

  const todaysSales = todaysOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const yesterdaysSales = yesterdaysOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

  return c.json({
    grossSales,
    todaysSales,
    yesterdaysSales,
    todaysOrderCount: todaysOrders.length,
    yesterdaysOrderCount: yesterdaysOrders.length,
    lowStockCount: lowStockProducts.length,
  });
});

export default reportsRoutes;
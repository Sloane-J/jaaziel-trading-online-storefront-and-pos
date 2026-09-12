import { and, asc, desc, eq, gte, lte, ne } from "drizzle-orm";
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
const LOW_STOCK_THRESHOLD = 5;

function parseDateRange(c: {
  req: { query: (key: string) => string | undefined };
}): { start: Date; end: Date } {
  const startParam = c.req.query("start");
  const endParam = c.req.query("end");

  const end = endParam ? new Date(endParam) : new Date();
  end.setHours(23, 59, 59, 999);

  const start = startParam ? new Date(startParam) : new Date();
  if (!startParam) {
    start.setDate(start.getDate() - 6); // default: last 7 days
  }
  start.setHours(0, 0, 0, 0);

  return { start, end };
}

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

  const categoryNames = new Set<string>();
  const dayMap = new Map<string, Record<string, number> & { date: string }>();

  for (let i = 0; i < DAYS; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dayMap.set(key, { date: key } as Record<string, number> & { date: string });
  }

  for (const row of rows) {
    const key = new Date(row.createdAt).toISOString().slice(0, 10);
    const bucket = dayMap.get(key);
    if (!bucket) continue;

    categoryNames.add(row.categoryName);
    const lineTotal = Number(row.unitPrice) * row.quantity;
    bucket[row.categoryName] = (bucket[row.categoryName] ?? 0) + lineTotal;
  }

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

// GET /overview-stats — admin/superadmin. Gross sales (all-time), delivery revenue,
// today's sales and order count with day-over-day trend, and low-stock count.
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
  const deliveryRevenue = allOrders.reduce((sum, o) => sum + Number(o.deliveryFee), 0);

  const todaysOrders = allOrders.filter((o) => new Date(o.createdAt) >= startOfToday);
  const yesterdaysOrders = allOrders.filter(
    (o) => new Date(o.createdAt) >= startOfYesterday && new Date(o.createdAt) < startOfToday,
  );

  const todaysSales = todaysOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const yesterdaysSales = yesterdaysOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

  return c.json({
    grossSales,
    deliveryRevenue,
    todaysSales,
    yesterdaysSales,
    todaysOrderCount: todaysOrders.length,
    yesterdaysOrderCount: yesterdaysOrders.length,
    lowStockCount: lowStockProducts.length,
  });
});

// GET /range-summary — admin/superadmin. Revenue, order count, and average order
// value for a given date range, plus the same figures for the immediately
// preceding period of equal length (for trend comparison).
reportsRoutes.get("/range-summary", requireAuth(["admin", "superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");
  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  const { start, end } = parseDateRange(c);
  const rangeMs = end.getTime() - start.getTime();
  const previousEnd = new Date(start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - rangeMs);

  const [currentOrders, previousOrders, lowStockProducts] = await Promise.all([
    db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.tenantId, tenantId),
          ne(orders.status, "cancelled"),
          gte(orders.createdAt, start),
          lte(orders.createdAt, end),
        ),
      ),
    db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.tenantId, tenantId),
          ne(orders.status, "cancelled"),
          gte(orders.createdAt, previousStart),
          lte(orders.createdAt, previousEnd),
        ),
      ),
    db
      .select({ id: products.id })
      .from(products)
      .where(
        and(
          eq(products.tenantId, tenantId),
          eq(products.isActive, true),
          lte(products.stock, LOW_STOCK_THRESHOLD),
        ),
      ),
  ]);

  const revenue = currentOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const previousRevenue = previousOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const orderCount = currentOrders.length;
  const previousOrderCount = previousOrders.length;
  const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;

  return c.json({
    revenue,
    previousRevenue,
    orderCount,
    previousOrderCount,
    avgOrderValue,
    lowStockCount: lowStockProducts.length,
  });
});

// GET /inventory — admin/superadmin. Full active product list with stock levels
// and category names, for the Reports inventory table.
reportsRoutes.get("/inventory", requireAuth(["admin", "superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");
  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      stock: products.stock,
      price: products.price,
      categoryName: categories.name,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.tenantId, tenantId), eq(products.isActive, true)))
    .orderBy(asc(products.stock));

  return c.json(rows);
});

function toCsv(headers: string[], rows: (string | number)[][]): string {
  const escapeCell = (cell: string | number) => {
    const str = String(cell);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [headers.map(escapeCell).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCell).join(","));
  }
  return lines.join("\n");
}

// GET /export — admin only (superadmin explicitly blocked from Reports export,
// unlike every other report endpoint above). type=sales|inventory|both.
reportsRoutes.get("/export", requireAuth(["admin"]), async (c) => {
  const tenantId = c.get("tenantId");
  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  const type = c.req.query("type") ?? "both";
  const { start, end } = parseDateRange(c);

  const parts: string[] = [];

  if (type === "sales" || type === "both") {
    const salesRows = await db
      .select({
        id: orders.id,
        createdAt: orders.createdAt,
        channel: orders.channel,
        status: orders.status,
        totalAmount: orders.totalAmount,
        deliveryFee: orders.deliveryFee,
      })
      .from(orders)
      .where(
        and(
          eq(orders.tenantId, tenantId),
          ne(orders.status, "cancelled"),
          gte(orders.createdAt, start),
          lte(orders.createdAt, end),
        ),
      )
      .orderBy(desc(orders.createdAt));

    parts.push("SALES");
    parts.push(
      toCsv(
        ["Order ID", "Date", "Channel", "Status", "Total", "Delivery Fee"],
        salesRows.map((o) => [
          o.id,
          new Date(o.createdAt).toISOString().slice(0, 10),
          o.channel,
          o.status,
          o.totalAmount,
          o.deliveryFee,
        ]),
      ),
    );
  }

  if (type === "inventory" || type === "both") {
    const inventoryRows = await db
      .select({
        name: products.name,
        stock: products.stock,
        price: products.price,
        categoryName: categories.name,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.tenantId, tenantId), eq(products.isActive, true)))
      .orderBy(asc(products.stock));

    if (parts.length > 0) parts.push("");
    parts.push("INVENTORY");
    parts.push(
      toCsv(
        ["Product", "Category", "Stock", "Price"],
        inventoryRows.map((p) => [p.name, p.categoryName, p.stock, p.price]),
      ),
    );
  }

  const csv = parts.join("\n");
  const filename = `jaaziel-report-${new Date().toISOString().slice(0, 10)}.csv`;

  return c.text(csv, 200, {
    "Content-Type": "text/csv",
    "Content-Disposition": `attachment; filename="${filename}"`,
  });
});

export default reportsRoutes;
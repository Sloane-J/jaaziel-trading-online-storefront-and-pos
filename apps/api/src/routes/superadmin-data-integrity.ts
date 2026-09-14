import { and, desc, eq, isNull, lt, sql } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db/client";
import { activityLogs } from "../db/schema/activity-logs";
import { carts } from "../db/schema/carts";
import { categories } from "../db/schema/categories";
import { cronRuns } from "../db/schema/cron-runs";
import { orderItems } from "../db/schema/order-items";
import { orders } from "../db/schema/orders";
import { products } from "../db/schema/products";
import { user } from "../db/schema/auth";
import { requireAuth } from "../middleware/require-auth";
import type { Variables } from "../types/context";

const dataIntegrityRoutes = new Hono<{ Variables: Variables }>();

// Columns this app's code depends on existing, checked directly against
// Postgres's own information_schema rather than Drizzle's migration
// bookkeeping — the drift we hit this session was Drizzle's snapshot
// disagreeing with reality, so this asks the database itself instead.
const EXPECTED_COLUMNS: { table: string; column: string }[] = [
  { table: "user", column: "is_active" },
  { table: "orders", column: "order_code" },
  { table: "orders", column: "delivery_fee" },
  { table: "orders", column: "contact_name" },
  { table: "activity_logs", column: "id" },
  { table: "cron_runs", column: "id" },
  { table: "storefront_settings", column: "id" },
  { table: "delivery_zones", column: "id" },
];

const STALE_CART_DAYS = 14;

// GET / — superadmin only. Table health counts, orphaned-record checks,
// inventory sanity checks, a targeted schema-drift check, and the most
// recent cron job run.
dataIntegrityRoutes.get("/", requireAuth(["superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");
  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  // --- Table health counts ---
  const [
    orderCount,
    productCount,
    categoryCount,
    userCount,
    activityLogCount,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(orders).where(eq(orders.tenantId, tenantId)),
    db.select({ count: sql<number>`count(*)::int` }).from(products).where(eq(products.tenantId, tenantId)),
    db.select({ count: sql<number>`count(*)::int` }).from(categories).where(eq(categories.tenantId, tenantId)),
    db.select({ count: sql<number>`count(*)::int` }).from(user).where(eq(user.tenantId, tenantId)),
    db.select({ count: sql<number>`count(*)::int` }).from(activityLogs).where(eq(activityLogs.tenantId, tenantId)),
  ]);

  const tableCounts = {
    orders: orderCount[0]?.count ?? 0,
    products: productCount[0]?.count ?? 0,
    categories: categoryCount[0]?.count ?? 0,
    users: userCount[0]?.count ?? 0,
    activityLogs: activityLogCount[0]?.count ?? 0,
  };

  // --- Orphaned records ---
  // Order items whose product no longer exists. FK constraints don't
  // prevent this since products can be soft-deactivated (not hard-deleted),
  // but a product row itself could still theoretically be missing if one
  // was ever manually removed outside the app.
  const orphanedOrderItems = await db
    .select({ id: orderItems.id, orderId: orderItems.orderId })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(isNull(products.id));

  // Stale guest carts: no customer attached, not touched in 14+ days.
  // These aren't broken data (cartId has a real FK to carts.id, so true
  // orphaned cart_items can't exist) — just clutter worth surfacing.
  const staleCutoff = new Date();
  staleCutoff.setDate(staleCutoff.getDate() - STALE_CART_DAYS);

  const staleGuestCarts = await db
    .select({ id: carts.id, guestToken: carts.guestToken, updatedAt: carts.updatedAt })
    .from(carts)
    .where(
      and(
        eq(carts.tenantId, tenantId),
        isNull(carts.customerId),
        lt(carts.updatedAt, staleCutoff),
      ),
    );

  // --- Inventory sanity checks ---
  const negativeStock = await db
    .select({ id: products.id, name: products.name, stock: products.stock })
    .from(products)
    .where(and(eq(products.tenantId, tenantId), sql`${products.stock} < 0`));

  // --- Schema drift check (targeted, against real information_schema) ---
  const driftResults = await Promise.all(
    EXPECTED_COLUMNS.map(async ({ table, column }) => {
      const result = await db.execute(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = ${table} AND column_name = ${column}
        ) AS exists
      `);
      const row = (result as unknown as { rows?: { exists: boolean }[] }).rows?.[0];
      const exists = Boolean(row?.exists);
      return { table, column, exists };
    }),
  );

  const missingColumns = driftResults.filter((r) => !r.exists);

  // --- Latest cron run ---
  const [latestCronRun] = await db
    .select()
    .from(cronRuns)
    .orderBy(desc(cronRuns.ranAt))
    .limit(1);

  return c.json({
    tableCounts,
    orphanedRecords: {
      orderItemsWithMissingProduct: orphanedOrderItems.length,
    },
    staleGuestCarts: {
      count: staleGuestCarts.length,
      olderThanDays: STALE_CART_DAYS,
    },
    inventoryIssues: {
      negativeStock,
    },
    schemaDrift: {
      checked: EXPECTED_COLUMNS.length,
      missing: missingColumns,
      healthy: missingColumns.length === 0,
    },
    latestCronRun: latestCronRun ?? null,
  });
});

export default dataIntegrityRoutes;
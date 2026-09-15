import { desc, sql } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db/client";
import { cronRuns } from "../db/schema/cron-runs";
import { requireAuth } from "../middleware/require-auth";
import type { Variables } from "../types/context";

const healthRoutes = new Hono<{ Variables: Variables }>();

// GET / — superadmin only. Basic system health: DB connectivity, latest
// cron run, and a rough uptime signal via response timing.
healthRoutes.get("/", requireAuth(["superadmin"]), async (c) => {
  const startedAt = Date.now();

  let dbHealthy = true;
  let dbError: string | null = null;

  try {
    await db.execute(sql`SELECT 1`);
  } catch (err) {
    dbHealthy = false;
    dbError = err instanceof Error ? err.message : String(err);
  }

  const dbLatencyMs = Date.now() - startedAt;

  const [latestCronRun] = await db
    .select()
    .from(cronRuns)
    .orderBy(desc(cronRuns.ranAt))
    .limit(1);

  // A run is only "on schedule" if it happened within the last ~25 hours —
  // gives a little slack past the 24h daily interval before flagging it
  // as overdue.
  const cronIsRecent =
    latestCronRun !== undefined &&
    Date.now() - new Date(latestCronRun.ranAt).getTime() < 25 * 60 * 60 * 1000;

  return c.json({
    database: {
      healthy: dbHealthy,
      latencyMs: dbLatencyMs,
      error: dbError,
    },
    cron: {
      latestRun: latestCronRun ?? null,
      isOnSchedule: cronIsRecent,
    },
    checkedAt: new Date().toISOString(),
  });
});

export default healthRoutes;
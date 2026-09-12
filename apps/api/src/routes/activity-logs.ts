import { and, desc, eq, gte } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db/client";
import { activityLogs } from "../db/schema/activity-logs";
import { requireAuth } from "../middleware/require-auth";
import type { Variables } from "../types/context";

const activityLogsRoutes = new Hono<{ Variables: Variables }>();

const RETENTION_DAYS = 90;

// GET / — admin/superadmin only. Lists activity logs for the tenant, most
// recent first. Only returns logs within the retention window, even if
// older ones haven't been cleaned up yet by the scheduled job.
activityLogsRoutes.get("/", requireAuth(["admin", "superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");
  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

  const logs = await db
    .select()
    .from(activityLogs)
    .where(and(eq(activityLogs.tenantId, tenantId), gte(activityLogs.createdAt, cutoff)))
    .orderBy(desc(activityLogs.createdAt));

  return c.json(logs);
});

export default activityLogsRoutes;
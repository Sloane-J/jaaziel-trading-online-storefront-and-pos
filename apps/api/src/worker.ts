import { lt } from "drizzle-orm";
import { db } from "./db/client";
import { activityLogs } from "./db/schema/activity-logs";
import { cronRuns } from "./db/schema/cron-runs";
import app from "./index";

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};

const ACTIVITY_LOG_RETENTION_DAYS = 90;

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const response = await app.fetch(request, env, ctx);
    const newResponse = new Response(response.body, response);

    Object.entries(securityHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value);
    });

    return newResponse;
  },

  async scheduled(
    _event: ScheduledEvent,
    _env: unknown,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(
      (async () => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - ACTIVITY_LOG_RETENTION_DAYS);

        try {
          const deleted = await db
            .delete(activityLogs)
            .where(lt(activityLogs.createdAt, cutoff))
            .returning({ id: activityLogs.id });

          await db.insert(cronRuns).values({
            jobName: "activity-logs-cleanup",
            rowsAffected: deleted.length,
            success: true,
          });
        } catch (err) {
          await db.insert(cronRuns).values({
            jobName: "activity-logs-cleanup",
            rowsAffected: 0,
            success: false,
            errorMessage: err instanceof Error ? err.message : String(err),
          });
        }
      })(),
    );
  },
};
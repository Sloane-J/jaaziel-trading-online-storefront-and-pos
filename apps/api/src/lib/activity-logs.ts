import { db } from "../db/client";
import { activityLogs } from "../db/schema/activity-logs";

type LogActivityInput = {
  tenantId: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: string;
};

export async function logActivity(input: LogActivityInput) {
  await db.insert(activityLogs).values(input);
}
import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const cronRuns = pgTable("cron_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobName: text("job_name").notNull(),
  ranAt: timestamp("ran_at").notNull().defaultNow(),
  rowsAffected: integer("rows_affected").notNull().default(0),
  success: boolean("success").notNull().default(true),
  errorMessage: text("error_message"),
});
import { jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { user } from "./auth";

export const propertySubmissionStatusEnum = pgEnum("property_submission_status", [
  "pending",
  "listed",
  "declined",
]);

export const propertySubmissions = pgTable("property_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  submitterName: text("submitter_name").notNull(),
  submitterPhone: text("submitter_phone").notNull(),
  propertyType: text("property_type").notNull(),
  description: text("description").notNull(),
  images: jsonb("images").$type<string[]>().default([]),
  status: propertySubmissionStatusEnum("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by").references(() => user.id),
});
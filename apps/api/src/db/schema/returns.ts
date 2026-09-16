import { boolean, jsonb, numeric, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { tenants } from "./tenants";
import { user } from "./auth";

export const returnStatusEnum = pgEnum("return_status", [
  "requested",
  "item_received",
  "approved",
  "rejected",
  "refunded",
]);

export const returnRequestedByEnum = pgEnum("return_requested_by", [
  "customer",
  "admin",
]);

export type ReturnItem = {
  productId: string;
  quantity: number;
  reason: string | null;
};

export const returns = pgTable("returns", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  items: jsonb("items").$type<ReturnItem[]>().notNull(),
  requestedBy: returnRequestedByEnum("requested_by").notNull(),
  status: returnStatusEnum("status").notNull().default("requested"),
  refundAmount: numeric("refund_amount", { precision: 10, scale: 2 }),
  includeDeliveryFee: boolean("include_delivery_fee"),
  paystackReference: text("paystack_reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
  processedBy: text("processed_by").references(() => user.id),
});
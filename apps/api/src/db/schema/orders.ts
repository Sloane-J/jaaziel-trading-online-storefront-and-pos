import { pgTable, uuid, text, timestamp, numeric, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { users } from "./users";

export const orderChannelEnum = pgEnum("order_channel", ["online", "in_store"]);
export const fulfillmentTypeEnum = pgEnum("fulfillment_type", ["delivery", "pickup_in_store"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "packed",
  "out_for_delivery",
  "completed",
  "cancelled",
]);
export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "paid", "refunded"]);

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id),
  customerId: uuid("customer_id").references(() => users.id),
  cashierId: uuid("cashier_id").references(() => users.id),
  channel: orderChannelEnum("channel").notNull(),
  fulfillmentType: fulfillmentTypeEnum("fulfillment_type").notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("unpaid"),
  paymentMethod: text("payment_method"),
  paymentReference: text("payment_reference"),
  deliveryAddress: jsonb("delivery_address").$type<Record<string, unknown>>(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
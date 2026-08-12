import {
	jsonb,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { tenants } from "./tenants";

export const orderChannelEnum = pgEnum("order_channel", ["online", "in_store"]);
export const fulfillmentTypeEnum = pgEnum("fulfillment_type", [
	"delivery",
	"pickup_in_store",
]);
export const orderStatusEnum = pgEnum("order_status", [
	"pending",
	"confirmed",
	"packed",
	"out_for_delivery",
	"completed",
	"cancelled",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
	"unpaid",
	"paid",
	"refunded",
]);

export const orders = pgTable("orders", {
	id: uuid("id").primaryKey().defaultRandom(),
	tenantId: uuid("tenant_id")
		.notNull()
		.references(() => tenants.id),
	customerId: text("customer_id").references(() => user.id),
	cashierId: text("cashier_id").references(() => user.id),
	channel: orderChannelEnum("channel").notNull(),
	fulfillmentType: fulfillmentTypeEnum("fulfillment_type").notNull(),
	status: orderStatusEnum("status").notNull().default("pending"),
	paymentStatus: paymentStatusEnum("payment_status")
		.notNull()
		.default("unpaid"),
	paymentMethod: text("payment_method"),
	paymentReference: text("payment_reference"),
	deliveryAddress: jsonb("delivery_address").$type<Record<string, unknown>>(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: numeric("delivery_fee", { precision: 10, scale: 2 }).notNull().default("0"),
  orderCode: text("order_code").notNull().default("LEGACY"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
});


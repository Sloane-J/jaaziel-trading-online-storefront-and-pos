import {
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { orders } from "./orders";
import { products } from "./products";
import { tenants } from "./tenants";

export const movementTypeEnum = pgEnum("movement_type", [
	"sale",
	"restock",
	"adjustment",
	"return",
]);

export const inventoryMovements = pgTable("inventory_movements", {
	id: uuid("id").primaryKey().defaultRandom(),
	tenantId: uuid("tenant_id")
		.notNull()
		.references(() => tenants.id),
	productId: uuid("product_id")
		.notNull()
		.references(() => products.id),
	type: movementTypeEnum("type").notNull(),
	quantityChange: integer("quantity_change").notNull(),
	reason: text("reason"),
	orderId: uuid("order_id").references(() => orders.id),
	performedBy: text("performed_by").references(() => user.id),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

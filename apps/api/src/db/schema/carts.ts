import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { tenants } from "./tenants";

export const carts = pgTable("carts", {
	id: uuid("id").primaryKey().defaultRandom(),
	tenantId: uuid("tenant_id")
		.notNull()
		.references(() => tenants.id),
	customerId: text("customer_id").references(() => user.id),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

import {
	boolean,
	integer,
	jsonb,
	numeric,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { tenants } from "./tenants";

export const products = pgTable(
	"products",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		tenantId: uuid("tenant_id")
			.notNull()
			.references(() => tenants.id),
		categoryId: uuid("category_id")
			.notNull()
			.references(() => categories.id),
		name: text("name").notNull(),
		slug: text("slug").notNull(),
		description: text("description"),
		price: numeric("price", { precision: 10, scale: 2 }).notNull(),
		stock: integer("stock").notNull().default(0),
		images: jsonb("images").$type<string[]>().default([]),
		attributes: jsonb("attributes").$type<Record<string, unknown>>().default({}),
		isActive: boolean("is_active").notNull().default(true),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex("products_tenant_id_slug_idx").on(table.tenantId, table.slug),
	],
);
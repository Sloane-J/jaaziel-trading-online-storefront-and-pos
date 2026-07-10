import { jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { tenants } from "./tenants";

export const storefrontSettings = pgTable("storefront_settings", {
	id: uuid("id").primaryKey().defaultRandom(),
	tenantId: uuid("tenant_id")
		.notNull()
		.unique()
		.references(() => tenants.id),

	// Top banner carousel — ordered list of image URLs, admin-configurable.
	topBannerImages: jsonb("top_banner_images").$type<string[]>().default([]),

	// Second banner, placed lower on the homepage.
	secondBannerImages: jsonb("second_banner_images")
		.$type<string[]>()
		.default([]),

	// Hero bento — 2 featured category slots.
	heroPrimaryCategoryId: uuid("hero_primary_category_id").references(
		() => categories.id,
	),
	heroSecondaryCategoryId: uuid("hero_secondary_category_id").references(
		() => categories.id,
	),

	// 3-category spotlight section, in display order.
	spotlightCategoryIds: jsonb("spotlight_category_ids")
		.$type<string[]>()
		.default([]),

	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

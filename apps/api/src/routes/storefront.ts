import { and, desc, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db/client";
import { categories } from "../db/schema/categories";
import { products } from "../db/schema/products";
import { storefrontSettings } from "../db/schema/storefront-settings";
import type { Variables } from "../types/context";

const storefrontRoutes = new Hono<{ Variables: Variables }>();

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID;

async function latestProductForCategory(
	categoryId: string,
	tenantId: string,
) {
	const [product] = await db
		.select()
		.from(products)
		.where(
			and(
				eq(products.categoryId, categoryId),
				eq(products.tenantId, tenantId),
				eq(products.isActive, true),
			),
		)
		.orderBy(desc(products.createdAt))
		.limit(1);

	return product ?? null;
}

async function resolveActiveCategory(
	categoryId: string | null,
	tenantId: string,
) {
	if (!categoryId) return null;

	const [cat] = await db
		.select()
		.from(categories)
		.where(
			and(
				eq(categories.id, categoryId),
				eq(categories.tenantId, tenantId),
				eq(categories.isActive, true),
			),
		)
		.limit(1);

	return cat ?? null;
}

// GET /storefront/home
storefrontRoutes.get("/home", async (c) => {
	if (!DEFAULT_TENANT_ID) {
		return c.json(
			{ error: "Server misconfigured: missing DEFAULT_TENANT_ID" },
			500,
		);
	}

	const [settings] = await db
		.select()
		.from(storefrontSettings)
		.where(eq(storefrontSettings.tenantId, DEFAULT_TENANT_ID))
		.limit(1);

	if (!settings) {
		return c.json({
			topBannerImages: [],
			secondBannerImages: [],
			hero: {
				primary: null,
				secondary: null,
			},
			spotlight: [],
		});
	}

	const [primaryCategory, secondaryCategory] = await Promise.all([
		resolveActiveCategory(
			settings.heroPrimaryCategoryId,
			DEFAULT_TENANT_ID,
		),
		resolveActiveCategory(
			settings.heroSecondaryCategoryId,
			DEFAULT_TENANT_ID,
		),
	]);

	const [primaryProduct, secondaryProduct] = await Promise.all([
		primaryCategory
			? latestProductForCategory(primaryCategory.id, DEFAULT_TENANT_ID)
			: null,
		secondaryCategory
			? latestProductForCategory(secondaryCategory.id, DEFAULT_TENANT_ID)
			: null,
	]);

	const spotlightCategoryIds = settings.spotlightCategoryIds ?? [];

	const spotlightCategories =
		spotlightCategoryIds.length > 0
			? await db
					.select()
					.from(categories)
					.where(
						and(
							inArray(categories.id, spotlightCategoryIds),
							eq(categories.tenantId, DEFAULT_TENANT_ID),
							eq(categories.isActive, true),
						),
					)
			: [];

	const spotlight = await Promise.all(
		spotlightCategoryIds
			.map((id) => spotlightCategories.find((cat) => cat.id === id))
			.filter(
				(cat): cat is (typeof spotlightCategories)[number] =>
					cat !== undefined,
			)
			.map(async (category) => ({
				category,
				product: await latestProductForCategory(
					category.id,
					DEFAULT_TENANT_ID,
				),
			})),
	);

	return c.json({
		topBannerImages: settings.topBannerImages ?? [],
		secondBannerImages: settings.secondBannerImages ?? [],
		hero: {
			primary: primaryCategory
				? {
						category: primaryCategory,
						product: primaryProduct,
					}
				: null,
			secondary: secondaryCategory
				? {
						category: secondaryCategory,
						product: secondaryProduct,
					}
				: null,
		},
		spotlight,
	});
});

// GET /storefront/categories-preview
storefrontRoutes.get("/categories-preview", async (c) => {
	if (!DEFAULT_TENANT_ID) {
		return c.json(
			{ error: "Server misconfigured: missing DEFAULT_TENANT_ID" },
			500,
		);
	}

	const activeCategories = await db
		.select()
		.from(categories)
		.where(
			and(
				eq(categories.tenantId, DEFAULT_TENANT_ID),
				eq(categories.isActive, true),
			),
		);

	const results = await Promise.all(
		activeCategories.map(async (category) => ({
			category,
			product: await latestProductForCategory(
				category.id,
				DEFAULT_TENANT_ID,
			),
		})),
	);

	return c.json(results);
});

export default storefrontRoutes;
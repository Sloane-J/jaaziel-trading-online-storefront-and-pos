import { and, desc, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db/client";
import { categories } from "../db/schema/categories";
import { products } from "../db/schema/products";
import { storefrontSettings } from "../db/schema/storefront-settings";
import { requireAuth } from "../middleware/require-auth";
import type { Variables } from "../types/context";

const storefrontRoutes = new Hono<{ Variables: Variables }>();

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID;

async function latestProductForCategory(categoryId: string, tenantId: string) {
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
    c.header("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
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
		resolveActiveCategory(settings.heroPrimaryCategoryId, DEFAULT_TENANT_ID),
		resolveActiveCategory(settings.heroSecondaryCategoryId, DEFAULT_TENANT_ID),
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
				(cat): cat is (typeof spotlightCategories)[number] => cat !== undefined,
			)
			.map(async (category) => ({
				category,
				product: await latestProductForCategory(category.id, DEFAULT_TENANT_ID),
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
    c.header("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
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
			product: await latestProductForCategory(category.id, DEFAULT_TENANT_ID),
		})),
	);

	return c.json(results);
});

const updateSettingsSchema = z.object({
	topBannerImages: z.array(z.string().url()).optional(),
	secondBannerImages: z.array(z.string().url()).optional(),
	heroPrimaryCategoryId: z.string().uuid().nullable().optional(),
	heroSecondaryCategoryId: z.string().uuid().nullable().optional(),
	spotlightCategoryIds: z
		.array(z.string().uuid())
		.max(3, "Choose up to 3 categories")
		.optional(),
});

// GET /settings — admin/superadmin only. Returns the tenant's storefront settings row.
storefrontRoutes.get(
	"/settings",
	requireAuth(["admin", "superadmin"]),
	async (c) => {
		const tenantId = c.get("tenantId");

		if (!tenantId) {
			return c.json({ error: "No tenant associated with this account" }, 400);
		}

		const [settings] = await db
			.select()
			.from(storefrontSettings)
			.where(eq(storefrontSettings.tenantId, tenantId))
			.limit(1);

		if (!settings) {
			// No row yet — return sensible defaults rather than erroring.
			return c.json({
				tenantId,
				topBannerImages: [],
				secondBannerImages: [],
				heroPrimaryCategoryId: null,
				heroSecondaryCategoryId: null,
				spotlightCategoryIds: [],
			});
		}

		return c.json(settings);
	},
);

// PATCH /settings — admin/superadmin only. Creates or updates the tenant's storefront settings.
storefrontRoutes.patch(
	"/settings",
	requireAuth(["admin", "superadmin"]),
	async (c) => {
		const tenantId = c.get("tenantId");

		if (!tenantId) {
			return c.json({ error: "No tenant associated with this account" }, 400);
		}

		const body = await c.req.json();
		const parsed = updateSettingsSchema.safeParse(body);

		if (!parsed.success) {
			return c.json({ error: parsed.error.flatten() }, 400);
		}

		const [existing] = await db
			.select()
			.from(storefrontSettings)
			.where(eq(storefrontSettings.tenantId, tenantId))
			.limit(1);

		if (existing) {
			const [updated] = await db
				.update(storefrontSettings)
				.set({ ...parsed.data, updatedAt: new Date() })
				.where(eq(storefrontSettings.tenantId, tenantId))
				.returning();

			return c.json(updated);
		}

		const [created] = await db
			.insert(storefrontSettings)
			.values({ tenantId, ...parsed.data })
			.returning();

		return c.json(created, 201);
	},
);

export default storefrontRoutes;

import { and, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db/client";
import { categories } from "../db/schema/categories";
import { orderItems } from "../db/schema/order-items";
import { orders } from "../db/schema/orders";
import { products } from "../db/schema/products";
import { requireAuth } from "../middleware/require-auth";
import type { Variables } from "../types/context";

const posRoutes = new Hono<{ Variables: Variables }>();

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID;

const saleItemSchema = z.object({
	productId: z.string().uuid(),
	quantity: z.coerce.number().int().min(1),
});

const createSaleSchema = z.object({
	items: z
		.array(saleItemSchema)
		.min(1, "Add at least one item to complete the sale"),
	paymentMethod: z.enum(["cash", "mobile_money", "card"]),
});

// POST /sale — cashier/admin only. Creates an in-store order + items in one go,
// marks it paid immediately (POS sales are settled on the spot, no pending state).
posRoutes.post(
	"/sale",
	requireAuth(["cashier", "admin", "superadmin"]),
	async (c) => {
		if (!DEFAULT_TENANT_ID) {
			return c.json(
				{ error: "Server misconfigured: missing DEFAULT_TENANT_ID" },
				500,
			);
		}

		const user = c.get("user");
		const body = await c.req.json();
		const parsed = createSaleSchema.safeParse(body);

		if (!parsed.success) {
			return c.json({ error: parsed.error.flatten() }, 400);
		}

		const productIds = parsed.data.items.map((item) => item.productId);

		const foundProducts = await db
			.select()
			.from(products)
			.where(
				and(
					inArray(products.id, productIds),
					eq(products.tenantId, DEFAULT_TENANT_ID),
					eq(products.isActive, true),
				),
			);

		const productById = new Map(foundProducts.map((p) => [p.id, p]));

		// Validate every requested product exists, is active, and has enough stock.
		for (const item of parsed.data.items) {
			const product = productById.get(item.productId);
			if (!product) {
				return c.json(
					{ error: `A product in this sale is no longer available.` },
					400,
				);
			}
			if (product.stock < item.quantity) {
				return c.json(
					{
						error: `Not enough stock for "${product.name}". Only ${product.stock} left.`,
					},
					400,
				);
			}
		}

		const totalAmount = parsed.data.items.reduce((sum, item) => {
			const product = productById.get(item.productId)!;
			return sum + Number(product.price) * item.quantity;
		}, 0);

		const [order] = await db
			.insert(orders)
			.values({
				tenantId: DEFAULT_TENANT_ID,
				cashierId: user!.id,
				channel: "in_store",
				fulfillmentType: "pickup_in_store",
				status: "completed",
				paymentStatus: "paid",
				paymentMethod: parsed.data.paymentMethod,
				totalAmount: String(totalAmount),
			})
			.returning();

		const itemRows = parsed.data.items.map((item) => {
			const product = productById.get(item.productId)!;
			return {
				orderId: order.id,
				productId: item.productId,
				quantity: item.quantity,
				unitPrice: product.price,
			};
		});

		await db.insert(orderItems).values(itemRows);

		// Decrement stock for each product sold.
		for (const item of parsed.data.items) {
			const product = productById.get(item.productId)!;
			await db
				.update(products)
				.set({ stock: product.stock - item.quantity, updatedAt: new Date() })
				.where(eq(products.id, item.productId));
		}

		return c.json({ order, items: itemRows }, 201);
	},
);

// GET /catalog — cashier/admin/superadmin. Returns active categories and products for POS selection.
posRoutes.get(
	"/catalog",
	requireAuth(["cashier", "admin", "superadmin"]),
	async (c) => {
		if (!DEFAULT_TENANT_ID) {
			return c.json(
				{ error: "Server misconfigured: missing DEFAULT_TENANT_ID" },
				500,
			);
		}

		const [activeCategories, activeProducts] = await Promise.all([
			db
				.select()
				.from(categories)
				.where(
					and(
						eq(categories.tenantId, DEFAULT_TENANT_ID),
						eq(categories.isActive, true),
					),
				),
			db
				.select()
				.from(products)
				.where(
					and(
						eq(products.tenantId, DEFAULT_TENANT_ID),
						eq(products.isActive, true),
					),
				),
		]);

		return c.json({ categories: activeCategories, products: activeProducts });
	},
);

export default posRoutes;

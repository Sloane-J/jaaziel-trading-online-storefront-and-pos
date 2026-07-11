import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db/client";
import { cartItems } from "../db/schema/cart-items";
import { carts } from "../db/schema/carts";
import { products } from "../db/schema/products";
import type { Variables } from "../types/context";

const cartRoutes = new Hono<{ Variables: Variables }>();

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID;

const GUEST_TOKEN_HEADER = "x-guest-token";

const addItemSchema = z.object({
	productId: z.string().uuid(),
	quantity: z.coerce.number().int().min(1).default(1),
});

const updateItemSchema = z.object({
	quantity: z.coerce.number().int().min(1),
});

// Resolves (or creates) the cart for the current visitor — logged-in customer or guest.
async function resolveCart(c: any, tenantId: string) {
	const user = c.get("user");
	const guestToken = c.req.header(GUEST_TOKEN_HEADER);

	if (user) {
		const [existing] = await db
			.select()
			.from(carts)
			.where(and(eq(carts.tenantId, tenantId), eq(carts.customerId, user.id)))
			.limit(1);

		if (existing) return existing;

		const [created] = await db
			.insert(carts)
			.values({ tenantId, customerId: user.id })
			.returning();
		return created;
	}

	if (guestToken) {
		const [existing] = await db
			.select()
			.from(carts)
			.where(
				and(eq(carts.tenantId, tenantId), eq(carts.guestToken, guestToken)),
			)
			.limit(1);

		if (existing) return existing;

		const [created] = await db
			.insert(carts)
			.values({ tenantId, guestToken })
			.returning();
		return created;
	}

	return null;
}

async function getCartWithItems(cartId: string) {
	const items = await db
		.select({
			id: cartItems.id,
			productId: cartItems.productId,
			quantity: cartItems.quantity,
			product: products,
		})
		.from(cartItems)
		.innerJoin(products, eq(cartItems.productId, products.id))
		.where(eq(cartItems.cartId, cartId));

	return items;
}

// GET / — returns the current visitor's cart (logged-in or guest via x-guest-token header).
cartRoutes.get("/", async (c) => {
	if (!DEFAULT_TENANT_ID) {
		return c.json(
			{ error: "Server misconfigured: missing DEFAULT_TENANT_ID" },
			500,
		);
	}

	const cart = await resolveCart(c, DEFAULT_TENANT_ID);

	if (!cart) {
		// No session and no guest token yet — nothing to show, empty cart.
		return c.json({ cart: null, items: [] });
	}

	const items = await getCartWithItems(cart.id);
	return c.json({ cart, items });
});

// POST /items — adds a product to the cart, or increments quantity if already present.
cartRoutes.post("/items", async (c) => {
	if (!DEFAULT_TENANT_ID) {
		return c.json(
			{ error: "Server misconfigured: missing DEFAULT_TENANT_ID" },
			500,
		);
	}

	const cart = await resolveCart(c, DEFAULT_TENANT_ID);

	if (!cart) {
		return c.json(
			{ error: "Could not identify your cart. Please refresh and try again." },
			400,
		);
	}

	const body = await c.req.json();
	const parsed = addItemSchema.safeParse(body);

	if (!parsed.success) {
		return c.json({ error: parsed.error.flatten() }, 400);
	}

	const [product] = await db
		.select()
		.from(products)
		.where(
			and(
				eq(products.id, parsed.data.productId),
				eq(products.tenantId, DEFAULT_TENANT_ID),
				eq(products.isActive, true),
			),
		)
		.limit(1);

	if (!product) {
		return c.json({ error: "This product is no longer available." }, 400);
	}

	const [existingItem] = await db
		.select()
		.from(cartItems)
		.where(
			and(
				eq(cartItems.cartId, cart.id),
				eq(cartItems.productId, parsed.data.productId),
			),
		)
		.limit(1);

	if (existingItem) {
		const [updated] = await db
			.update(cartItems)
			.set({ quantity: existingItem.quantity + parsed.data.quantity })
			.where(eq(cartItems.id, existingItem.id))
			.returning();

		return c.json(updated);
	}

	const [created] = await db
		.insert(cartItems)
		.values({
			cartId: cart.id,
			productId: parsed.data.productId,
			quantity: parsed.data.quantity,
		})
		.returning();

	return c.json(created, 201);
});

// PATCH /items/:id — updates the quantity of a specific cart item.
cartRoutes.patch("/items/:id", async (c) => {
	if (!DEFAULT_TENANT_ID) {
		return c.json(
			{ error: "Server misconfigured: missing DEFAULT_TENANT_ID" },
			500,
		);
	}

	const cart = await resolveCart(c, DEFAULT_TENANT_ID);
	if (!cart) {
		return c.json({ error: "Could not identify your cart." }, 400);
	}

	const id = c.req.param("id");
	const body = await c.req.json();
	const parsed = updateItemSchema.safeParse(body);

	if (!parsed.success) {
		return c.json({ error: parsed.error.flatten() }, 400);
	}

	const [updated] = await db
		.update(cartItems)
		.set({ quantity: parsed.data.quantity })
		.where(and(eq(cartItems.id, id), eq(cartItems.cartId, cart.id)))
		.returning();

	if (!updated) {
		return c.json({ error: "Cart item not found" }, 404);
	}

	return c.json(updated);
});

// DELETE /items/:id — removes an item from the cart entirely.
cartRoutes.delete("/items/:id", async (c) => {
	if (!DEFAULT_TENANT_ID) {
		return c.json(
			{ error: "Server misconfigured: missing DEFAULT_TENANT_ID" },
			500,
		);
	}

	const cart = await resolveCart(c, DEFAULT_TENANT_ID);
	if (!cart) {
		return c.json({ error: "Could not identify your cart." }, 400);
	}

	const id = c.req.param("id");

	const [deleted] = await db
		.delete(cartItems)
		.where(and(eq(cartItems.id, id), eq(cartItems.cartId, cart.id)))
		.returning();

	if (!deleted) {
		return c.json({ error: "Cart item not found" }, 404);
	}

	return c.json({ success: true });
});

export default cartRoutes;

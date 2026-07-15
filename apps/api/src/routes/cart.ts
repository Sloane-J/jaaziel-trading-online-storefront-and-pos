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

	const id = c.req.param("id") as string;
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

	const id = c.req.param("id") as string;

	const [deleted] = await db
		.delete(cartItems)
		.where(and(eq(cartItems.id, id), eq(cartItems.cartId, cart.id)))
		.returning();

	if (!deleted) {
		return c.json({ error: "Cart item not found" }, 404);
	}

	return c.json({ success: true });
});

const mergeCartSchema = z.object({
  guestToken: z.string().min(1),
});

// POST /merge — called right after login. Merges a guest cart's items into the
// logged-in customer's cart (creating one if needed), then deletes the guest cart.
cartRoutes.post("/merge", async (c) => {
  if (!DEFAULT_TENANT_ID) {
    return c.json({ error: "Server misconfigured: missing DEFAULT_TENANT_ID" }, 500);
  }

  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Must be logged in to merge a cart" }, 401);
  }

  const body = await c.req.json();
  const parsed = mergeCartSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const [guestCart] = await db
    .select()
    .from(carts)
    .where(
      and(eq(carts.tenantId, DEFAULT_TENANT_ID), eq(carts.guestToken, parsed.data.guestToken)),
    )
    .limit(1);

  // No guest cart to merge — just return (or create) the customer's own cart.
  if (!guestCart) {
    const [existingCustomerCart] = await db
      .select()
      .from(carts)
      .where(and(eq(carts.tenantId, DEFAULT_TENANT_ID), eq(carts.customerId, user.id)))
      .limit(1);

    const customerCart =
      existingCustomerCart ??
      (
        await db
          .insert(carts)
          .values({ tenantId: DEFAULT_TENANT_ID, customerId: user.id })
          .returning()
      )[0];

    const items = await getCartWithItems(customerCart.id);
    return c.json({ cart: customerCart, items });
  }

  const guestItems = await db.select().from(cartItems).where(eq(cartItems.cartId, guestCart.id));

  const [existingCustomerCart] = await db
    .select()
    .from(carts)
    .where(and(eq(carts.tenantId, DEFAULT_TENANT_ID), eq(carts.customerId, user.id)))
    .limit(1);

  const customerCart =
    existingCustomerCart ??
    (
      await db
        .insert(carts)
        .values({ tenantId: DEFAULT_TENANT_ID, customerId: user.id })
        .returning()
    )[0];

  for (const guestItem of guestItems) {
    const [existingCustomerItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, customerCart.id),
          eq(cartItems.productId, guestItem.productId),
        ),
      )
      .limit(1);

    if (existingCustomerItem) {
      await db
        .update(cartItems)
        .set({ quantity: existingCustomerItem.quantity + guestItem.quantity })
        .where(eq(cartItems.id, existingCustomerItem.id));
    } else {
      await db.insert(cartItems).values({
        cartId: customerCart.id,
        productId: guestItem.productId,
        quantity: guestItem.quantity,
      });
    }
  }

  // Clean up the now-merged guest cart entirely.
  await db.delete(cartItems).where(eq(cartItems.cartId, guestCart.id));
  await db.delete(carts).where(eq(carts.id, guestCart.id));

  const items = await getCartWithItems(customerCart.id);
  return c.json({ cart: customerCart, items });
});

export default cartRoutes;

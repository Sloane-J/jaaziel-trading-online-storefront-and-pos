import { and, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db/client";
import { cartItems } from "../db/schema/cart-items";
import { carts } from "../db/schema/carts";
import { orderItems } from "../db/schema/order-items";
import { orders } from "../db/schema/orders";
import { products } from "../db/schema/products";
import type { Variables } from "../types/context";

const checkoutRoutes = new Hono<{ Variables: Variables }>();

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID;
const GUEST_TOKEN_HEADER = "x-guest-token";

const checkoutSchema = z.object({
  fulfillmentType: z.enum(["delivery", "pickup_in_store"]),
  contactName: z.string().trim().min(1, "Name is required"),
  contactPhone: z.string().trim().min(1, "Phone number is required"),
  contactEmail: z.string().email().optional(),
  deliveryAddress: z
    .object({
      street: z.string().trim().min(1),
      area: z.string().trim().min(1),
      landmark: z.string().trim().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    })
    .optional(),
  deliveryFee: z.coerce.number().min(0).default(0),
});

// POST / — creates an order from the current visitor's cart (guest or logged-in).
// Order is created as pending/unpaid; payment happens in a separate step.
checkoutRoutes.post("/", async (c) => {
  if (!DEFAULT_TENANT_ID) {
    return c.json({ error: "Server misconfigured: missing DEFAULT_TENANT_ID" }, 500);
  }

  const body = await c.req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  if (parsed.data.fulfillmentType === "delivery" && !parsed.data.deliveryAddress) {
    return c.json({ error: "Delivery address is required for delivery orders." }, 400);
  }

  const user = c.get("user");
  const guestToken = c.req.header(GUEST_TOKEN_HEADER);

  // Resolve the visitor's cart the same way /cart does.
  let cart;
  if (user) {
    [cart] = await db
      .select()
      .from(carts)
      .where(and(eq(carts.tenantId, DEFAULT_TENANT_ID), eq(carts.customerId, user.id)))
      .limit(1);
  } else if (guestToken) {
    [cart] = await db
      .select()
      .from(carts)
      .where(and(eq(carts.tenantId, DEFAULT_TENANT_ID), eq(carts.guestToken, guestToken)))
      .limit(1);
  }

  if (!cart) {
    return c.json({ error: "Your cart could not be found. Please refresh and try again." }, 400);
  }

  const items = await db.select().from(cartItems).where(eq(cartItems.cartId, cart.id));

  if (items.length === 0) {
    return c.json({ error: "Your cart is empty." }, 400);
  }

  const productIds = items.map((item) => item.productId);
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

  // Re-validate stock and pricing server-side, same principle as the POS sale route.
  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product) {
      return c.json({ error: "An item in your cart is no longer available." }, 400);
    }
    if (product.stock < item.quantity) {
      return c.json(
        { error: `Not enough stock for "${product.name}". Only ${product.stock} left.` },
        400,
      );
    }
  }

  const itemsTotal = items.reduce((sum, item) => {
    const product = productById.get(item.productId)!;
    return sum + Number(product.price) * item.quantity;
  }, 0);

  const totalAmount = itemsTotal + parsed.data.deliveryFee;

  const [order] = await db
    .insert(orders)
    .values({
      tenantId: DEFAULT_TENANT_ID,
      customerId: user?.id ?? null,
      channel: "online",
      fulfillmentType: parsed.data.fulfillmentType,
      status: "pending",
      paymentStatus: "unpaid",
      deliveryAddress: parsed.data.deliveryAddress ?? null,
      totalAmount: String(totalAmount),
    })
    .returning();

  const orderItemRows = items.map((item) => {
    const product = productById.get(item.productId)!;
    return {
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: product.price,
    };
  });

  await db.insert(orderItems).values(orderItemRows);

  // Clear the cart now that the order has been created.
  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

  return c.json({ order, items: orderItemRows }, 201);
});

export default checkoutRoutes;
import { and, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db/client";
import { cartItems } from "../db/schema/cart-items";
import { carts } from "../db/schema/carts";
import { deliveryZones } from "../db/schema/delivery-zones";
import { orderItems } from "../db/schema/order-items";
import { orders } from "../db/schema/orders";
import { products } from "../db/schema/products";
import { getDistanceKm } from "../lib/delivery-distance";
import type { Variables } from "../types/context";

const checkoutRoutes = new Hono<{ Variables: Variables }>();

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID;
const GUEST_TOKEN_HEADER = "x-guest-token";

const DELIVERY_BASE_FEE = 20;
const DELIVERY_RATE_PER_3KM = 10;

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
});

function generateOrderCode(): string {
  // 6-character alphanumeric code, easy to read/say aloud — excludes visually
  // ambiguous characters like 0/O and 1/I.
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

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

  // Delivery fee is always recomputed server-side here, never trusted from the client.
  let actualDeliveryFee = 0;

  if (parsed.data.fulfillmentType === "delivery" && parsed.data.deliveryAddress) {
    const areaKey = parsed.data.deliveryAddress.area.trim().toLowerCase();

    const [cached] = await db
      .select()
      .from(deliveryZones)
      .where(and(eq(deliveryZones.tenantId, DEFAULT_TENANT_ID), eq(deliveryZones.areaKey, areaKey)))
      .limit(1);

    const distanceKm = cached ? Number(cached.distanceKm) : await getDistanceKm(areaKey);

    if (!cached) {
      await db.insert(deliveryZones).values({
        tenantId: DEFAULT_TENANT_ID,
        areaKey,
        distanceKm: String(distanceKm),
      });
    }

    actualDeliveryFee = DELIVERY_BASE_FEE + ((distanceKm * 2) / 3) * DELIVERY_RATE_PER_3KM;
  }

  const totalAmount = itemsTotal + actualDeliveryFee;
  
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
        contactName: parsed.data.contactName,
        contactPhone: parsed.data.contactPhone,
        contactEmail: parsed.data.contactEmail ?? null,
        totalAmount: String(totalAmount),
        deliveryFee: String(actualDeliveryFee),
        orderCode: generateOrderCode(),
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

  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

  return c.json({ order, items: orderItemRows }, 201);
});

// POST /delivery-fee — public. Calculates delivery fee for a given area (used to
// show an estimate to the customer before they submit their order).
const deliveryFeeRequestSchema = z.object({
  area: z.string().trim().min(1, "Area is required"),
});

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  return true;
}

checkoutRoutes.post("/delivery-fee", async (c) => {
  if (!DEFAULT_TENANT_ID) {
    return c.json({ error: "Server misconfigured: missing DEFAULT_TENANT_ID" }, 500);
  }

  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return c.json({ error: "Too many requests. Please try again shortly." }, 429);
  }

  const body = await c.req.json();
  const parsed = deliveryFeeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const areaKey = parsed.data.area.trim().toLowerCase();

  const [cached] = await db
    .select()
    .from(deliveryZones)
    .where(and(eq(deliveryZones.tenantId, DEFAULT_TENANT_ID), eq(deliveryZones.areaKey, areaKey)))
    .limit(1);

  let distanceKm: number;

  if (cached) {
    distanceKm = Number(cached.distanceKm);
  } else {
    distanceKm = await getDistanceKm(areaKey);
    await db.insert(deliveryZones).values({
      tenantId: DEFAULT_TENANT_ID,
      areaKey,
      distanceKm: String(distanceKm),
    });
  }

  const fee = DELIVERY_BASE_FEE + ((distanceKm * 2) / 3) * DELIVERY_RATE_PER_3KM;

  return c.json({ distanceKm, fee });
});

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const initPaymentSchema = z.object({
  orderId: z.string().uuid(),
});

// POST /pay — initializes a Paystack transaction for an existing pending order.
// Charges the order's full total (product + delivery), all going to the store's
// main account. No split — see order.deliveryFee for the breakdown in records.
checkoutRoutes.post("/pay", async (c) => {
  if (!DEFAULT_TENANT_ID || !PAYSTACK_SECRET_KEY) {
    return c.json({ error: "Payment is not configured. Please contact the store." }, 500);
  }

  const body = await c.req.json();
  const parsed = initPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, parsed.data.orderId), eq(orders.tenantId, DEFAULT_TENANT_ID)))
    .limit(1);

  if (!order) {
    return c.json({ error: "Order not found." }, 404);
  }

  if (order.paymentStatus === "paid") {
    return c.json({ error: "This order has already been paid for." }, 400);
  }

  const amountInPesewas = Math.round(Number(order.totalAmount) * 100);

  const paystackBody = {
    email: order.contactEmail ?? `guest-${order.id}@jaazieltrading.com`,
    amount: amountInPesewas,
    currency: "GHS",
    reference: order.id,
    channels: ["card", "mobile_money"],
    callback_url: `${process.env.WEB_URL}/order-confirmation/${order.id}`,
  };

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paystackBody),
  });

  const data = await res.json();

  if (!data.status) {
    return c.json({ error: data.message ?? "Could not start payment. Please try again." }, 400);
  }

  return c.json({
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
  });
});

export default checkoutRoutes;
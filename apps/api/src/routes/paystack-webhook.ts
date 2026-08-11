import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { orders } from "../db/schema/orders";
import type { Variables } from "../types/context";

const paystackWebhookRoutes = new Hono<{ Variables: Variables }>();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

async function verifySignature(rawBody: string, signature: string | undefined): Promise<boolean> {
  if (!signature || !PAYSTACK_SECRET_KEY) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(PAYSTACK_SECRET_KEY),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const computedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computedSignature === signature;
}

// POST /webhook — Paystack calls this after a payment event. Verifies the request
// is genuinely from Paystack (via signature), then marks the order as paid.
paystackWebhookRoutes.post("/webhook", async (c) => {
  const rawBody = await c.req.text();
  const signature = c.req.header("x-paystack-signature");

  const isValid = await verifySignature(rawBody, signature);
  if (!isValid) {
    return c.json({ error: "Invalid signature" }, 401);
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const orderId = event.data.reference;

    await db
      .update(orders)
      .set({ paymentStatus: "paid", status: "confirmed", updatedAt: new Date() })
      .where(eq(orders.id, orderId));
  }

  return c.json({ received: true });
});

export default paystackWebhookRoutes;
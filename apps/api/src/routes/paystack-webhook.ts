import { Hono } from "hono";
import { and, eq, ne } from "drizzle-orm";
import { db } from "../db/client";
import { orders } from "../db/schema/orders";
import { logActivity } from "../lib/activity-logs";
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
// is genuinely from Paystack (via signature), confirms the amount paid actually
// matches the order total (defense-in-depth beyond just trusting the reference),
// then marks the order as paid. Guards against duplicate webhook retries by only
// acting when the order isn't already marked paid.
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
    const paidAmountInPesewas = event.data.amount;

    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

    if (!order) {
      // Reference doesn't match any known order — nothing to reconcile here,
      // acknowledge so Paystack doesn't keep retrying.
      return c.json({ received: true });
    }

    const expectedAmountInPesewas = Math.round(Number(order.totalAmount) * 100);

    if (paidAmountInPesewas !== expectedAmountInPesewas) {
      // Amount mismatch: don't mark as paid. Left as-is for manual review via
      // the superadmin payment reconciliation tool rather than silently trusting it.
      return c.json({ received: true, warning: "amount_mismatch" });
    }

    // Idempotency guard: if a retry delivers this event again, skip the write
    // and the duplicate log entry — the order's already in the right state.
    if (order.paymentStatus !== "paid") {
      await db
        .update(orders)
        .set({ paymentStatus: "paid", status: "confirmed", updatedAt: new Date() })
        .where(and(eq(orders.id, orderId), ne(orders.paymentStatus, "paid")));

      await logActivity({
        tenantId: order.tenantId,
        actorId: "system",
        actorName: "Paystack webhook",
        action: "payment.confirmed",
        targetType: "order",
        targetId: order.id,
        details: `Payment confirmed via Paystack for order totaling GHS ${order.totalAmount}`,
      });
    }
  }

  return c.json({ received: true });
});

export default paystackWebhookRoutes;
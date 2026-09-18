import { Hono } from "hono";
import { imagekit } from "../lib/imagekit";
import { requireAuth } from "../middleware/require-auth";
import type { Variables } from "../types/context";

const uploadsRoutes = new Hono<{ Variables: Variables }>();

// GET /uploads/imagekit-auth — admin/superadmin only.
// Returns a short-lived signature the frontend uses to upload directly to ImageKit.
uploadsRoutes.get(
  "/imagekit-auth",
  requireAuth(["admin", "superadmin"]),
  (c) => {
    const authParams = imagekit.getAuthenticationParameters();
    return c.json(authParams);
  },
);

// GET /uploads/property-submission-auth — public, rate-limited. Lets an
// unauthenticated visitor upload photos when submitting a property listing.
// Deliberately separate from the admin-only endpoint above, and rate
// limited since it's the only unauthenticated upload path in the app.
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

uploadsRoutes.get("/property-submission-auth", (c) => {
  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return c.json({ error: "Too many requests. Please try again shortly." }, 429);
  }

  const authParams = imagekit.getAuthenticationParameters();
  return c.json(authParams);
});

export default uploadsRoutes;
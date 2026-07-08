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

export default uploadsRoutes;
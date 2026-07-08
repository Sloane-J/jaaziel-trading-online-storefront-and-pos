import type { Context, Next } from "hono";
import type { Variables } from "../types/context";

export function requireAuth(allowedRoles?: string[]) {
  return async (c: Context<{ Variables: Variables }>, next: Next) => {
    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (allowedRoles && !allowedRoles.includes(user.role ?? "")) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await next();
  };
}
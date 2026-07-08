import type { Context, Next } from "hono";
import { auth } from "../lib/auth";
import type { AppUser, Variables } from "../types/context";

export async function sessionMiddleware(
  c: Context<{ Variables: Variables }>,
  next: Next,
) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("tenantId", null);
    await next();
    return;
  }

  const user = session.user as AppUser;

  c.set("user", user);
  c.set("tenantId", user.tenantId ?? null);
  await next();
}
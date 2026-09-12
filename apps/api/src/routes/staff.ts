import { and, eq, ne } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db/client";
import { user } from "../db/schema/auth";
import { auth } from "../lib/auth";
import { logActivity } from "../lib/activity-logs";
import { requireAuth } from "../middleware/require-auth";
import type { Variables } from "../types/context";

const staffRoutes = new Hono<{ Variables: Variables }>();

// Roles assignable via Staff Management. "superadmin" is intentionally
// excluded — it's fixed/seeded only, never assignable through this UI.
const ASSIGNABLE_ROLES = ["admin", "cashier", "staff"] as const;

const createStaffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("A valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(ASSIGNABLE_ROLES),
});

const updateStaffSchema = z.object({
  role: z.enum(ASSIGNABLE_ROLES).optional(),
  isActive: z.boolean().optional(),
});

// GET / — admin/superadmin only. Lists staff accounts for the tenant
// (excludes customers, since this page manages staff, not shoppers).
staffRoutes.get("/", requireAuth(["admin", "superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");
  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  const staff = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(and(eq(user.tenantId, tenantId), ne(user.role, "customer")));

  return c.json(staff);
});

// POST / — admin/superadmin only. Creates a new staff account via Better
// Auth (so password hashing/session setup is handled consistently), then
// sets role/tenantId/isActive as a follow-up update since additionalFields
// with input: false can't be set at signup time.
staffRoutes.post("/", requireAuth(["admin", "superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");
  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  const actor = c.get("user")!;

  const body = await c.req.json();
  const parsed = createStaffSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const { name, email, password, role } = parsed.data;

  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existing.length > 0) {
    return c.json({ error: "An account with this email already exists" }, 409);
  }

  const signUpResult = await auth.api.signUpEmail({
    body: { name, email, password },
  });

  if (!signUpResult?.user) {
    return c.json({ error: "Failed to create staff account" }, 500);
  }

  const [updated] = await db
    .update(user)
    .set({ role, tenantId, isActive: true })
    .where(eq(user.id, signUpResult.user.id))
    .returning({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    });

  await logActivity({
    tenantId,
    actorId: actor.id,
    actorName: actor.name ?? actor.email,
    action: "staff.created",
    targetType: "user",
    targetId: updated.id,
    details: `Created staff account "${updated.name}" with role "${role}"`,
  });

  return c.json(updated, 201);
});

// PATCH /:id — admin/superadmin only. Updates a staff member's role and/or
// active status. Scoped to the same tenant, and can never target a
// superadmin account (protects against privilege escalation or lockout).
staffRoutes.patch("/:id", requireAuth(["admin", "superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");
  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  const actor = c.get("user")!;
  const id = c.req.param("id") as string;
  const body = await c.req.json();
  const parsed = updateStaffSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  if (Object.keys(parsed.data).length === 0) {
    return c.json({ error: "No changes provided" }, 400);
  }

  const [target] = await db
    .select({ role: user.role, name: user.name })
    .from(user)
    .where(and(eq(user.id, id), eq(user.tenantId, tenantId)))
    .limit(1);

  if (!target) {
    return c.json({ error: "Staff member not found" }, 404);
  }

  if (target.role === "superadmin") {
    return c.json({ error: "Superadmin accounts cannot be modified here" }, 403);
  }

  const [updated] = await db
    .update(user)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(user.id, id), eq(user.tenantId, tenantId)))
    .returning({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    });

  if (parsed.data.role && parsed.data.role !== target.role) {
    await logActivity({
      tenantId,
      actorId: actor.id,
      actorName: actor.name ?? actor.email,
      action: "staff.role_changed",
      targetType: "user",
      targetId: id,
      details: `Changed "${target.name}"'s role from "${target.role}" to "${parsed.data.role}"`,
    });
  }

  if (typeof parsed.data.isActive === "boolean") {
    await logActivity({
      tenantId,
      actorId: actor.id,
      actorName: actor.name ?? actor.email,
      action: parsed.data.isActive ? "staff.activated" : "staff.deactivated",
      targetType: "user",
      targetId: id,
      details: `${parsed.data.isActive ? "Activated" : "Deactivated"} "${target.name}"`,
    });
  }

  return c.json(updated);
});

export default staffRoutes;
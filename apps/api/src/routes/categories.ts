import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db/client";
import { categories } from "../db/schema/categories";
import { requireAuth } from "../middleware/require-auth";
import type { Variables } from "../types/context";

const categoriesRoutes = new Hono<{ Variables: Variables }>();

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID;

const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().trim().optional(),
});

const updateCategorySchema = createCategorySchema.partial();

// GET / — public, no auth. Returns active categories for the default tenant.
categoriesRoutes.get("/", async (c) => {
  if (!DEFAULT_TENANT_ID) {
    return c.json({ error: "Server misconfigured: missing DEFAULT_TENANT_ID" }, 500);
  }

  const results = await db
    .select()
    .from(categories)
    .where(
      and(eq(categories.tenantId, DEFAULT_TENANT_ID), eq(categories.isActive, true)),
    );

  return c.json(results);
});

// POST / — admin/superadmin only. Creates a category scoped to the caller's tenant.
categoriesRoutes.post("/", requireAuth(["admin", "superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");

  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  const body = await c.req.json();
  const parsed = createCategorySchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const [created] = await db
    .insert(categories)
    .values({
      tenantId,
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
    })
    .returning();

  return c.json(created, 201);
});

// PATCH /:id — admin/superadmin only. Updates a category within the caller's tenant.
categoriesRoutes.patch("/:id", requireAuth(["admin", "superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");
  const id = c.req.param("id");

  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  const body = await c.req.json();
  const parsed = updateCategorySchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const [updated] = await db
    .update(categories)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(categories.id, id), eq(categories.tenantId, tenantId)))
    .returning();

  if (!updated) {
    return c.json({ error: "Category not found" }, 404);
  }

  return c.json(updated);
});

// PATCH /:id/deactivate — admin/superadmin only. Soft-delete via isActive: false.
categoriesRoutes.patch(
  "/:id/deactivate",
  requireAuth(["admin", "superadmin"]),
  async (c) => {
    const tenantId = c.get("tenantId");
    const id = c.req.param("id");

    if (!tenantId) {
      return c.json({ error: "No tenant associated with this account" }, 400);
    }

    const [updated] = await db
      .update(categories)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(categories.id, id), eq(categories.tenantId, tenantId)))
      .returning();

    if (!updated) {
      return c.json({ error: "Category not found" }, 404);
    }

    return c.json(updated);
  },
);

export default categoriesRoutes;
import { Hono } from "hono";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
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

// GET / — public, no auth. Returns only ACTIVE categories for the default tenant.
// Used by the public storefront.
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

// GET /admin/all — admin/superadmin only. Returns ALL categories (active + inactive) for the tenant.
// Registered BEFORE /:slug so "admin" is never matched as a slug value.
categoriesRoutes.get("/admin/all", requireAuth(["admin", "superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");

  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  const results = await db.select().from(categories).where(eq(categories.tenantId, tenantId));

  return c.json(results);
});

// GET /:slug — public. Returns a single active category by slug, for /shop/:slug pages.
categoriesRoutes.get("/:slug", async (c) => {
  if (!DEFAULT_TENANT_ID) {
    return c.json({ error: "Server misconfigured: missing DEFAULT_TENANT_ID" }, 500);
  }

  const slug = c.req.param("slug");

  const [category] = await db
    .select()
    .from(categories)
    .where(
      and(
        eq(categories.slug, slug),
        eq(categories.tenantId, DEFAULT_TENANT_ID),
        eq(categories.isActive, true),
      ),
    )
    .limit(1);

  if (!category) {
    return c.json({ error: "Category not found" }, 404);
  }

  return c.json(category);
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

  try {
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
  } catch (err: any) {
    if (err?.cause?.code === "23505") {
      return c.json(
        { error: "A category with this URL slug already exists. Please choose a different one." },
        400,
      );
    }
    throw err;
  }
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

  try {
    const [updated] = await db
      .update(categories)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(and(eq(categories.id, id), eq(categories.tenantId, tenantId)))
      .returning();

    if (!updated) {
      return c.json({ error: "Category not found" }, 404);
    }

    return c.json(updated);
  } catch (err: any) {
    if (err?.cause?.code === "23505") {
      return c.json(
        { error: "A category with this URL slug already exists. Please choose a different one." },
        400,
      );
    }
    throw err;
  }
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

// PATCH /:id/activate — admin/superadmin only. Reverses a soft-delete.
categoriesRoutes.patch(
  "/:id/activate",
  requireAuth(["admin", "superadmin"]),
  async (c) => {
    const tenantId = c.get("tenantId");
    const id = c.req.param("id");

    if (!tenantId) {
      return c.json({ error: "No tenant associated with this account" }, 400);
    }

    const [updated] = await db
      .update(categories)
      .set({ isActive: true, updatedAt: new Date() })
      .where(and(eq(categories.id, id), eq(categories.tenantId, tenantId)))
      .returning();

    if (!updated) {
      return c.json({ error: "Category not found" }, 404);
    }

    return c.json(updated);
  },
);

export default categoriesRoutes;
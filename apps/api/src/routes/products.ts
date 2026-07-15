import { and, eq, ilike } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db/client";
import { categories } from "../db/schema/categories";
import { products } from "../db/schema/products";
import { requireAuth } from "../middleware/require-auth";
import type { Variables } from "../types/context";

const productsRoutes = new Hono<{ Variables: Variables }>();

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID;

const createProductSchema = z.object({
  categoryId: z.string().uuid("Please choose a valid category"),
  name: z.string().trim().min(1, "Name is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().trim().optional(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative").default(0),
  images: z.array(z.string().url()).default([]),
  attributes: z.record(z.string(), z.string()).default({}),
});

const updateProductSchema = createProductSchema.partial();

async function categoryExistsInTenant(
  categoryId: string,
  tenantId: string,
): Promise<boolean> {
  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.tenantId, tenantId)))
    .limit(1);

  return Boolean(category);
}

// GET / — public. Returns only ACTIVE products for the default tenant.
// Used by the public storefront (customers should never see deactivated products).
productsRoutes.get("/", async (c) => {
  if (!DEFAULT_TENANT_ID) {
    c.header("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    return c.json({ error: "Server misconfigured: missing DEFAULT_TENANT_ID" }, 500);
  }

  const categoryId = c.req.query("categoryId");
  const q = c.req.query("q");

  const conditions = [
    eq(products.tenantId, DEFAULT_TENANT_ID),
    eq(products.isActive, true),
  ];

  if (categoryId) {
    conditions.push(eq(products.categoryId, categoryId));
  }

  if (q) {
    conditions.push(ilike(products.name, `%${q}%`));
  }

  const results = await db
    .select()
    .from(products)
    .where(and(...conditions));

  return c.json(results);
});

// GET /admin/all — admin/superadmin only. Returns ALL products (active + inactive) for the tenant.
// Used by the admin products table, so deactivated products remain visible and reactivatable.
productsRoutes.get("/admin/all", requireAuth(["admin", "superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");

  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  const results = await db.select().from(products).where(eq(products.tenantId, tenantId));

  return c.json(results);
});

// GET /:id — public. Single active product detail.
productsRoutes.get("/:id", async (c) => {
  if (!DEFAULT_TENANT_ID) {
    return c.json({ error: "Server misconfigured: missing DEFAULT_TENANT_ID" }, 500);
  }

  const id = c.req.param("id");

  const [product] = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.id, id),
        eq(products.tenantId, DEFAULT_TENANT_ID),
        eq(products.isActive, true),
      ),
    )
    .limit(1);

  if (!product) {
    return c.json({ error: "Product not found" }, 404);
  }

  return c.json(product);
});

// POST / — admin/superadmin only.
productsRoutes.post("/", requireAuth(["admin", "superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");

  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  const body = await c.req.json();
  const parsed = createProductSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const categoryValid = await categoryExistsInTenant(parsed.data.categoryId, tenantId);
  if (!categoryValid) {
    return c.json({ error: "Selected category does not exist. Please choose another." }, 400);
  }

  try {
    const [created] = await db
      .insert(products)
      .values({
        tenantId,
        categoryId: parsed.data.categoryId,
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        price: String(parsed.data.price),
        stock: parsed.data.stock,
        images: parsed.data.images,
        attributes: parsed.data.attributes,
      })
      .returning();

    return c.json(created, 201);
  } catch (err: any) {
    if (err?.cause?.code === "23505") {
      return c.json(
        { error: "A product with this URL slug already exists. Please choose a different one." },
        400,
      );
    }
    throw err;
  }
});

// PATCH /:id — admin/superadmin only.
productsRoutes.patch("/:id", requireAuth(["admin", "superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");
  const id = c.req.param("id");

  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  const body = await c.req.json();
  const parsed = updateProductSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  if (parsed.data.categoryId) {
    const categoryValid = await categoryExistsInTenant(parsed.data.categoryId, tenantId);
    if (!categoryValid) {
      return c.json({ error: "Selected category does not exist. Please choose another." }, 400);
    }
  }

  const { price, ...rest } = parsed.data;

  try {
    const [updated] = await db
      .update(products)
      .set({
        ...rest,
        ...(price !== undefined ? { price: String(price) } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
      .returning();

    if (!updated) {
      return c.json({ error: "Product not found" }, 404);
    }

    return c.json(updated);
  } catch (err: any) {
    if (err?.cause?.code === "23505") {
      return c.json(
        { error: "A product with this URL slug already exists. Please choose a different one." },
        400,
      );
    }
    throw err;
  }
});

// PATCH /:id/deactivate — admin/superadmin only. Soft-delete.
productsRoutes.patch(
  "/:id/deactivate",
  requireAuth(["admin", "superadmin"]),
  async (c) => {
    const tenantId = c.get("tenantId");
    const id = c.req.param("id");

    if (!tenantId) {
      return c.json({ error: "No tenant associated with this account" }, 400);
    }

    const [updated] = await db
      .update(products)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
      .returning();

    if (!updated) {
      return c.json({ error: "Product not found" }, 404);
    }

    return c.json(updated);
  },
);

// PATCH /:id/activate — admin/superadmin only. Reverses a soft-delete.
productsRoutes.patch(
  "/:id/activate",
  requireAuth(["admin", "superadmin"]),
  async (c) => {
    const tenantId = c.get("tenantId");
    const id = c.req.param("id");

    if (!tenantId) {
      return c.json({ error: "No tenant associated with this account" }, 400);
    }

    const [updated] = await db
      .update(products)
      .set({ isActive: true, updatedAt: new Date() })
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
      .returning();

    if (!updated) {
      return c.json({ error: "Product not found" }, 404);
    }

    return c.json(updated);
  },
);

export default productsRoutes;
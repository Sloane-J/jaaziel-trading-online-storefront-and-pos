import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db/client";
import { categories } from "../db/schema/categories";
import { products } from "../db/schema/products";
import { propertySubmissions } from "../db/schema/property-submissions";
import { logActivity } from "../lib/activity-logs";
import { requireAuth } from "../middleware/require-auth";
import type { Variables } from "../types/context";

const propertySubmissionsRoutes = new Hono<{ Variables: Variables }>();

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID;

const createSubmissionSchema = z.object({
  submitterName: z.string().trim().min(1, "Name is required"),
  submitterPhone: z.string().trim().min(1, "Phone number is required"),
  categoryId: z.string().uuid("Please choose a category"),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  images: z.array(z.string().url()).default([]),
});

// POST / — public. Submits a property for Jaaziel to review and potentially
// list. Always starts as "pending" — nothing goes live without admin review.
propertySubmissionsRoutes.post("/", async (c) => {
  if (!DEFAULT_TENANT_ID) {
    return c.json({ error: "Server misconfigured: missing DEFAULT_TENANT_ID" }, 500);
  }

  const body = await c.req.json();
  const parsed = createSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        eq(categories.id, parsed.data.categoryId),
        eq(categories.tenantId, DEFAULT_TENANT_ID),
        eq(categories.isInquiryOnly, true),
      ),
    )
    .limit(1);

  if (!category) {
    return c.json({ error: "Please choose a valid listing category." }, 400);
  }

  const [created] = await db
    .insert(propertySubmissions)
    .values({
      tenantId: DEFAULT_TENANT_ID,
      submitterName: parsed.data.submitterName,
      submitterPhone: parsed.data.submitterPhone,
      categoryId: parsed.data.categoryId,
      title: parsed.data.title,
      description: parsed.data.description,
      images: parsed.data.images,
      status: "pending",
    })
    .returning();

  return c.json(created, 201);
});

// GET / — admin/superadmin only. Lists all submissions, most recent first.
propertySubmissionsRoutes.get("/", requireAuth(["admin", "superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");
  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  const status = c.req.query("status");
  const conditions = [eq(propertySubmissions.tenantId, tenantId)];
  if (status) {
    conditions.push(
      eq(propertySubmissions.status, status as "pending" | "listed" | "declined"),
    );
  }

  const results = await db
    .select()
    .from(propertySubmissions)
    .where(and(...conditions))
    .orderBy(desc(propertySubmissions.createdAt));

  return c.json(results);
});

// GET /:id — admin/superadmin only.
propertySubmissionsRoutes.get("/:id", requireAuth(["admin", "superadmin"]), async (c) => {
  const tenantId = c.get("tenantId");
  if (!tenantId) {
    return c.json({ error: "No tenant associated with this account" }, 400);
  }

  const id = c.req.param("id") as string;

  const [submission] = await db
    .select()
    .from(propertySubmissions)
    .where(and(eq(propertySubmissions.id, id), eq(propertySubmissions.tenantId, tenantId)))
    .limit(1);

  if (!submission) {
    return c.json({ error: "Submission not found" }, 404);
  }

  return c.json(submission);
});

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

const declineSchema = z.object({
  status: z.literal("declined"),
  adminNotes: z.string().trim().max(1000).optional(),
});

const listSchema = z.object({
  status: z.literal("listed"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  stock: z.coerce.number().int().min(0).default(1),
  adminNotes: z.string().trim().max(1000).optional(),
});

const updateStatusSchema = z.union([declineSchema, listSchema]);

// PATCH /:id/status — admin/superadmin only. Approve or decline a
// submission. Approving ("listed") auto-creates a real, active product
// using the submission's title/description/images/category, plus the
// price the admin provides here — the only field the submission couldn't
// collect on its own.
propertySubmissionsRoutes.patch(
  "/:id/status",
  requireAuth(["admin", "superadmin"]),
  async (c) => {
    const tenantId = c.get("tenantId");
    if (!tenantId) {
      return c.json({ error: "No tenant associated with this account" }, 400);
    }

    const actor = c.get("user")!;
    const id = c.req.param("id") as string;
    const body = await c.req.json();
    const parsed = updateStatusSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.flatten() }, 400);
    }

    const [submission] = await db
      .select()
      .from(propertySubmissions)
      .where(and(eq(propertySubmissions.id, id), eq(propertySubmissions.tenantId, tenantId)))
      .limit(1);

    if (!submission) {
      return c.json({ error: "Submission not found" }, 404);
    }

    if (submission.status !== "pending") {
      return c.json({ error: "This submission has already been reviewed." }, 400);
    }

    if (parsed.data.status === "listed") {
      const baseSlug = slugify(submission.title);
      let slug = baseSlug;
      let attempt = 1;

      // Ensure slug uniqueness within the tenant, same pattern as the
      // admin Products form — append a numeric suffix on collision.
      while (
        (
          await db
            .select({ id: products.id })
            .from(products)
            .where(and(eq(products.tenantId, tenantId), eq(products.slug, slug)))
            .limit(1)
        ).length > 0
      ) {
        attempt += 1;
        slug = `${baseSlug}-${attempt}`;
      }

      await db.insert(products).values({
        tenantId,
        categoryId: submission.categoryId,
        name: submission.title,
        slug,
        description: submission.description,
        price: String(parsed.data.price),
        stock: parsed.data.stock,
        images: submission.images,
        attributes: {},
        isActive: true,
      });
    }

    const [updated] = await db
      .update(propertySubmissions)
      .set({
        status: parsed.data.status,
        adminNotes: parsed.data.adminNotes,
        reviewedAt: new Date(),
        reviewedBy: actor.id,
      })
      .where(and(eq(propertySubmissions.id, id), eq(propertySubmissions.tenantId, tenantId)))
      .returning();

    await logActivity({
      tenantId,
      actorId: actor.id,
      actorName: actor.name ?? actor.email,
      action: "property_submission.status_changed",
      targetType: "property_submission",
      targetId: id,
      details:
        parsed.data.status === "listed"
          ? `Listed property submission as a new product`
          : `Declined property submission`,
    });

    return c.json(updated);
  },
);

export default propertySubmissionsRoutes;
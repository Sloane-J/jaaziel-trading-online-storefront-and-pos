import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db/client";
import { propertySubmissions } from "../db/schema/property-submissions";
import { logActivity } from "../lib/activity-logs";
import { requireAuth } from "../middleware/require-auth";
import type { Variables } from "../types/context";

const propertySubmissionsRoutes = new Hono<{ Variables: Variables }>();

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID;

const createSubmissionSchema = z.object({
  submitterName: z.string().trim().min(1, "Name is required"),
  submitterPhone: z.string().trim().min(1, "Phone number is required"),
  propertyType: z.string().trim().min(1, "Property type is required"),
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

  const [created] = await db
    .insert(propertySubmissions)
    .values({
      tenantId: DEFAULT_TENANT_ID,
      submitterName: parsed.data.submitterName,
      submitterPhone: parsed.data.submitterPhone,
      propertyType: parsed.data.propertyType,
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

const updateStatusSchema = z.object({
  status: z.enum(["listed", "declined"]),
  adminNotes: z.string().trim().max(1000).optional(),
});

// PATCH /:id/status — admin/superadmin only. Approve or decline a
// submission. Does NOT automatically create a product — admin still adds
// it via the normal Products form once they've reviewed the details,
// keeping full control over how it's listed (price, category, etc.).
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

    if (!updated) {
      return c.json({ error: "Submission not found" }, 404);
    }

    await logActivity({
      tenantId,
      actorId: actor.id,
      actorName: actor.name ?? actor.email,
      action: "property_submission.status_changed",
      targetType: "property_submission",
      targetId: id,
      details: `Marked property submission as "${parsed.data.status}"`,
    });

    return c.json(updated);
  },
);

export default propertySubmissionsRoutes;
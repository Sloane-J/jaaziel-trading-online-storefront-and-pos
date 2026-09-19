const API_URL = import.meta.env.VITE_API_URL;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.error && typeof body.error === "string"
        ? body.error
        : res.status === 404
          ? "Not found"
          : `Something went wrong (status ${res.status})`;
    throw new Error(message);
  }
  return res.json();
}

export type PropertySubmissionStatus = "pending" | "listed" | "declined";

export type PropertySubmission = {
  id: string;
  tenantId: string;
  submitterName: string;
  submitterPhone: string;
  categoryId: string;
  title: string;
  description: string;
  images: string[];
  status: PropertySubmissionStatus;
  adminNotes: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
};

export type CreatePropertySubmissionInput = {
  submitterName: string;
  submitterPhone: string;
  categoryId: string;
  title: string;
  description: string;
  images: string[];
};

export async function createPropertySubmission(
  input: CreatePropertySubmissionInput,
): Promise<PropertySubmission> {
  const res = await fetch(`${API_URL}/property-submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handleResponse<PropertySubmission>(res);
}
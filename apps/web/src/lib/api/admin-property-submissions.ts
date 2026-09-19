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

export async function fetchPropertySubmissions(
  status?: PropertySubmissionStatus,
): Promise<PropertySubmission[]> {
  const params = status ? `?status=${status}` : "";
  const res = await fetch(`${API_URL}/property-submissions${params}`, {
    credentials: "include",
  });
  return handleResponse<PropertySubmission[]>(res);
}

export async function fetchPropertySubmission(id: string): Promise<PropertySubmission> {
  const res = await fetch(`${API_URL}/property-submissions/${id}`, {
    credentials: "include",
  });
  return handleResponse<PropertySubmission>(res);
}

export type UpdatePropertySubmissionStatusInput =
  | { status: "declined"; adminNotes?: string }
  | { status: "listed"; price: number; stock?: number; adminNotes?: string };

export async function updatePropertySubmissionStatus(
  id: string,
  input: UpdatePropertySubmissionStatusInput,
): Promise<PropertySubmission> {
  const res = await fetch(`${API_URL}/property-submissions/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return handleResponse<PropertySubmission>(res);
}
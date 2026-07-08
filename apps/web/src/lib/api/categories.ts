const API_URL = import.meta.env.VITE_API_URL;

export type Category = {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryInput = {
  name: string;
  slug: string;
  description?: string;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.error && typeof body.error === "string"
        ? body.error
        : `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return res.json();
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/categories`, {
    credentials: "include",
  });
  return handleResponse<Category[]>(res);
}

export async function createCategory(
  input: CreateCategoryInput,
): Promise<Category> {
  const res = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return handleResponse<Category>(res);
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<Category> {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return handleResponse<Category>(res);
}

export async function deactivateCategory(id: string): Promise<Category> {
  const res = await fetch(`${API_URL}/categories/${id}/deactivate`, {
    method: "PATCH",
    credentials: "include",
  });
  return handleResponse<Category>(res);
}
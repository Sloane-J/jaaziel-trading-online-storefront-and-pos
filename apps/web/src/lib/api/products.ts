const API_URL = import.meta.env.VITE_API_URL;

export type Product = {
  id: string;
  tenantId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  stock: number;
  images: string[];
  attributes: Record<string, string>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductInput = {
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  images: string[];
  attributes: Record<string, string>;
};

export type UpdateProductInput = Partial<CreateProductInput>;

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

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products`, {
    credentials: "include",
  });
  return handleResponse<Product[]>(res);
}

// Admin-only: returns ALL products (active + inactive) so deactivated ones stay visible/reactivatable.
export async function fetchAllProductsAdmin(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products/admin/all`, {
    credentials: "include",
  });
  return handleResponse<Product[]>(res);
}

export async function fetchProduct(id: string): Promise<Product> {
  const res = await fetch(`${API_URL}/products/${id}`, {
    credentials: "include",
  });
  return handleResponse<Product>(res);
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return handleResponse<Product>(res);
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput,
): Promise<Product> {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return handleResponse<Product>(res);
}

export async function deactivateProduct(id: string): Promise<Product> {
  const res = await fetch(`${API_URL}/products/${id}/deactivate`, {
    method: "PATCH",
    credentials: "include",
  });
  return handleResponse<Product>(res);
}

export async function activateProduct(id: string): Promise<Product> {
  const res = await fetch(`${API_URL}/products/${id}/activate`, {
    method: "PATCH",
    credentials: "include",
  });
  return handleResponse<Product>(res);
}
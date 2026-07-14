import type { Category } from "@/lib/api/categories";
import type { Product } from "@/lib/api/products";

const API_URL = import.meta.env.VITE_API_URL;

export type FeaturedSlot = {
  category: Category;
  product: Product | null;
} | null;

export type SpotlightItem = {
  category: Category;
  product: Product | null;
};

export type StorefrontHome = {
  topBannerImages: string[];
  secondBannerImages: string[];
  hero: {
    primary: FeaturedSlot;
    secondary: FeaturedSlot;
  };
  spotlight: SpotlightItem[];
};

export type CategoryPreview = {
  category: Category;
  product: Product | null;
};


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

export async function fetchStorefrontHome(): Promise<StorefrontHome> {
  const res = await fetch(`${API_URL}/storefront/home`);
  return handleResponse<StorefrontHome>(res);
}

export async function fetchPublicCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/categories`);
  return handleResponse<Category[]>(res);
}

export async function fetchCategoryBySlug(slug: string): Promise<Category> {
  const res = await fetch(`${API_URL}/categories/${slug}`);
  return handleResponse<Category>(res);
}

export async function fetchPublicProducts(categoryId?: string, q?: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (categoryId) params.set("categoryId", categoryId);
  if (q) params.set("q", q);

  const query = params.toString();
  const res = await fetch(`${API_URL}/products${query ? `?${query}` : ""}`);
  return handleResponse<Product[]>(res);
}

export async function fetchPublicProduct(id: string): Promise<Product> {
  const res = await fetch(`${API_URL}/products/${id}`);
  return handleResponse<Product>(res);
}

export async function fetchCategoriesPreview(): Promise<CategoryPreview[]> {
  const res = await fetch(`${API_URL}/storefront/categories-preview`);
  return handleResponse<CategoryPreview[]>(res);
}
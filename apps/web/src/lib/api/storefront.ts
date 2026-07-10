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

export async function fetchPublicProducts(categoryId?: string): Promise<Product[]> {
  const url = categoryId
    ? `${API_URL}/products?categoryId=${categoryId}`
    : `${API_URL}/products`;
  const res = await fetch(url);
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
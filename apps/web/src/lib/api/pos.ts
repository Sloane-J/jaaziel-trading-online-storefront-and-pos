import type { Category } from "@/lib/api/categories";
import type { Product } from "@/lib/api/products";

const API_URL = import.meta.env.VITE_API_URL;

export type PosCatalog = {
  categories: Category[];
  products: Product[];
};

export type SaleItem = {
  productId: string;
  quantity: number;
};

export type CreateSaleInput = {
  items: SaleItem[];
  paymentMethod: "cash" | "mobile_money" | "card";
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

export async function fetchPosCatalog(): Promise<PosCatalog> {
  const res = await fetch(`${API_URL}/pos/catalog`, {
    credentials: "include",
  });
  return handleResponse<PosCatalog>(res);
}

export async function createSale(input: CreateSaleInput) {
  const res = await fetch(`${API_URL}/pos/sale`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return handleResponse<{ order: any; items: any[] }>(res);
}

export async function fetchNextOrderNumber(): Promise<number> {
  const res = await fetch(`${API_URL}/pos/next-order-number`, {
    credentials: "include",
  });
  const data = await handleResponse<{ nextOrderNumber: number }>(res);
  return data.nextOrderNumber;
}
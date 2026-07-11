import type { Product } from "@/lib/api/products";
import { getGuestToken } from "@/lib/guest-token";

const API_URL = import.meta.env.VITE_API_URL;

export type Cart = {
  id: string;
  tenantId: string;
  customerId: string | null;
  guestToken: string | null;
} | null;

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
};

export type CartResponse = {
  cart: Cart;
  items: CartItem[];
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

function requestHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-guest-token": getGuestToken(),
  };
}

export async function fetchCart(): Promise<CartResponse> {
  const res = await fetch(`${API_URL}/cart`, {
    credentials: "include",
    headers: requestHeaders(),
  });
  return handleResponse<CartResponse>(res);
}

export async function addCartItem(productId: string, quantity = 1): Promise<CartItem> {
  const res = await fetch(`${API_URL}/cart/items`, {
    method: "POST",
    credentials: "include",
    headers: requestHeaders(),
    body: JSON.stringify({ productId, quantity }),
  });
  return handleResponse<CartItem>(res);
}

export async function updateCartItem(id: string, quantity: number): Promise<CartItem> {
  const res = await fetch(`${API_URL}/cart/items/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: requestHeaders(),
    body: JSON.stringify({ quantity }),
  });
  return handleResponse<CartItem>(res);
}

export async function removeCartItem(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/cart/items/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: requestHeaders(),
  });
  await handleResponse<{ success: boolean }>(res);
}

export async function mergeGuestCart(): Promise<CartResponse> {
  const res = await fetch(`${API_URL}/cart/merge`, {
    method: "POST",
    credentials: "include",
    headers: requestHeaders(),
    body: JSON.stringify({ guestToken: getGuestToken() }),
  });
  return handleResponse<CartResponse>(res);
}
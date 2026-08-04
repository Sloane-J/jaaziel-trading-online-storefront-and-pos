import { getGuestToken } from "@/lib/guest-token";

const API_URL = import.meta.env.VITE_API_URL;

export type CheckoutInput = {
  fulfillmentType: "delivery" | "pickup_in_store";
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  deliveryAddress?: {
    street: string;
    area: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
  };
  deliveryFee: number;
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

export async function createCheckout(input: CheckoutInput) {
  const res = await fetch(`${API_URL}/checkout`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-guest-token": getGuestToken(),
    },
    body: JSON.stringify(input),
  });
  return handleResponse<{ order: any; items: any[] }>(res);
}

export async function initiatePayment(orderId: string) {
  const res = await fetch(`${API_URL}/checkout/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
  return handleResponse<{ authorizationUrl: string; reference: string; totalCharged: number }>(res);
}
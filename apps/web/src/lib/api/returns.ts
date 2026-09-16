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

export type OrderLookupItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  productName: string;
};

export type ReturnRecord = {
  id: string;
  tenantId: string;
  orderId: string;
  items: { productId: string; quantity: number; reason: string | null }[];
  requestedBy: "customer" | "admin";
  status: "requested" | "item_received" | "approved" | "rejected" | "refunded";
  refundAmount: string | null;
  includeDeliveryFee: boolean | null;
  paystackReference: string | null;
  notes: string | null;
  createdAt: string;
  processedAt: string | null;
  processedBy: string | null;
};

export type OrderLookupResult = {
  order: {
    id: string;
    orderCode: string;
    createdAt: string;
    status: string;
    totalAmount: string;
    deliveryFee: string;
  };
  items: OrderLookupItem[];
  existingReturns: ReturnRecord[];
};

export async function lookupOrderForReturn(
  orderCode: string,
  phone: string,
): Promise<OrderLookupResult> {
  const res = await fetch(`${API_URL}/returns/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderCode, phone }),
  });
  return handleResponse<OrderLookupResult>(res);
}

export type CreateReturnInput = {
  orderId: string;
  orderCode: string;
  phone: string;
  items: { productId: string; quantity: number; reason?: string }[];
  paystackReference?: string;
  notes?: string;
};

export async function createReturn(input: CreateReturnInput): Promise<ReturnRecord> {
  const res = await fetch(`${API_URL}/returns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handleResponse<ReturnRecord>(res);
}
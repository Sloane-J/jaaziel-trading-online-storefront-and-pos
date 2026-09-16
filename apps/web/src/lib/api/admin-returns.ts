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

export type ReturnStatus =
  | "requested"
  | "item_received"
  | "approved"
  | "rejected"
  | "refunded";

export type ReturnRecord = {
  id: string;
  tenantId: string;
  orderId: string;
  items: { productId: string; quantity: number; reason: string | null }[];
  requestedBy: "customer" | "admin";
  status: ReturnStatus;
  refundAmount: string | null;
  includeDeliveryFee: boolean | null;
  paystackReference: string | null;
  notes: string | null;
  createdAt: string;
  processedAt: string | null;
  processedBy: string | null;
};

export type ReturnItemWithName = {
  productId: string;
  quantity: number;
  reason: string | null;
  productName: string;
};

export type ReturnDetail = {
  return: ReturnRecord;
  order: {
    id: string;
    orderCode: string;
    totalAmount: string;
    deliveryFee: string;
    contactName: string | null;
    contactPhone: string | null;
    createdAt: string;
  };
  items: ReturnItemWithName[];
};

export async function fetchReturns(): Promise<ReturnRecord[]> {
  const res = await fetch(`${API_URL}/returns`, { credentials: "include" });
  return handleResponse<ReturnRecord[]>(res);
}

export async function fetchReturnDetail(id: string): Promise<ReturnDetail> {
  const res = await fetch(`${API_URL}/returns/${id}`, { credentials: "include" });
  return handleResponse<ReturnDetail>(res);
}

export type UpdateReturnStatusInput = {
  status: "item_received" | "approved" | "rejected" | "refunded";
  refundAmount?: number;
  includeDeliveryFee?: boolean;
  notes?: string;
};

export async function updateReturnStatus(
  id: string,
  input: UpdateReturnStatusInput,
): Promise<ReturnRecord> {
  const res = await fetch(`${API_URL}/returns/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  return handleResponse<ReturnRecord>(res);
}

export async function restoreReturnInventory(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/returns/${id}/restore-inventory`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse<{ success: boolean }>(res);
}
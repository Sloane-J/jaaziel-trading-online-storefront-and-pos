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

export type OrderRecord = {
  id: string;
  tenantId: string;
  orderCode: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  channel: string;
  fulfillmentType: string;
  totalAmount: string;
  deliveryFee: string;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderItemRecord = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  productName: string;
};

export type OrderSearchResult = {
  order: OrderRecord;
  items: OrderItemRecord[];
};

export async function searchOrder(query: string): Promise<OrderSearchResult> {
  const params = new URLSearchParams({ q: query });
  const res = await fetch(`${API_URL}/superadmin/orders/search?${params}`, {
    credentials: "include",
  });
  return handleResponse<OrderSearchResult>(res);
}

export async function fetchFlaggedOrders(): Promise<OrderRecord[]> {
  const res = await fetch(`${API_URL}/superadmin/orders/flagged`, {
    credentials: "include",
  });
  return handleResponse<OrderRecord[]>(res);
}

export type PaymentVerification = {
  found: boolean;
  dbPaymentStatus: string;
  paystackStatus: string | null;
  paidAt?: string;
  amountMatches: boolean | null;
  paidAmount?: number;
  expectedAmount?: number;
  canApplyCorrection: boolean;
};

export async function verifyPayment(orderId: string): Promise<PaymentVerification> {
  const res = await fetch(`${API_URL}/superadmin/orders/${orderId}/verify-payment`, {
    credentials: "include",
  });
  return handleResponse<PaymentVerification>(res);
}

export async function applyPaymentCorrection(orderId: string): Promise<OrderRecord> {
  const res = await fetch(
    `${API_URL}/superadmin/orders/${orderId}/apply-payment-correction`,
    {
      method: "PATCH",
      credentials: "include",
    },
  );
  return handleResponse<OrderRecord>(res);
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<OrderRecord> {
  const res = await fetch(`${API_URL}/superadmin/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  return handleResponse<OrderRecord>(res);
}
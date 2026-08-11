const API_URL = import.meta.env.VITE_API_URL;

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export type OrderChannel = "online" | "in_store";

export type Order = {
  id: string;
  tenantId: string;
  customerId: string | null;
  cashierId: string | null;
  channel: OrderChannel;
  fulfillmentType: "delivery" | "pickup_in_store";
  status: OrderStatus;
  paymentStatus: "unpaid" | "paid" | "refunded";
  paymentMethod: string | null;
  paymentReference: string | null;
  deliveryAddress: Record<string, unknown> | null;
  deliveryFee: string;
  orderCode: string;
  totalAmount: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  productName: string;
};

export type OrderDetail = {
  order: Order;
  items: OrderItem[];
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

export async function fetchOrders(filters?: {
  status?: string;
  channel?: string;
}): Promise<Order[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.channel) params.set("channel", filters.channel);

  const query = params.toString();
  const res = await fetch(`${API_URL}/orders${query ? `?${query}` : ""}`, {
    credentials: "include",
  });
  return handleResponse<Order[]>(res);
}

export async function fetchOrder(id: string): Promise<OrderDetail> {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    credentials: "include",
  });
  return handleResponse<OrderDetail>(res);
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const res = await fetch(`${API_URL}/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  return handleResponse<Order>(res);
}

export type OrderConfirmation = {
  order: Order;
  items: OrderItem[];
  orderCode: string;
};

export async function fetchOrderConfirmation(id: string): Promise<OrderConfirmation> {
  const res = await fetch(`${API_URL}/orders/confirmation/${id}`);
  return handleResponse<OrderConfirmation>(res);
}
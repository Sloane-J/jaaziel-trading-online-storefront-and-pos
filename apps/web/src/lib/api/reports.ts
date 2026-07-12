const API_URL = import.meta.env.VITE_API_URL;

export type SalesByCategoryDay = { date: string } & Record<string, number | string>;

export type SalesByCategoryResponse = {
  days: SalesByCategoryDay[];
  categories: string[];
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

export async function fetchSalesByCategory(): Promise<SalesByCategoryResponse> {
  const res = await fetch(`${API_URL}/reports/sales-by-category`, {
    credentials: "include",
  });
  return handleResponse<SalesByCategoryResponse>(res);
}

export type LowStockProduct = {
  id: string;
  name: string;
  stock: number;
};

export type TodaySummary = {
  revenue: number;
  orderCount: number;
};

export async function fetchLowStock(threshold = 5): Promise<LowStockProduct[]> {
  const res = await fetch(`${API_URL}/reports/low-stock?threshold=${threshold}`, {
    credentials: "include",
  });
  return handleResponse<LowStockProduct[]>(res);
}

export async function fetchTodaySummary(): Promise<TodaySummary> {
  const res = await fetch(`${API_URL}/reports/today-summary`, {
    credentials: "include",
  });
  return handleResponse<TodaySummary>(res);
}
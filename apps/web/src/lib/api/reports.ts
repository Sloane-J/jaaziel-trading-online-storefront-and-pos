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

export type OverviewStatsResponse = {
  grossSales: number;
  deliveryRevenue: number;
  todaysSales: number;
  yesterdaysSales: number;
  todaysOrderCount: number;
  yesterdaysOrderCount: number;
  lowStockCount: number;
};

export async function fetchOverviewStats(): Promise<OverviewStatsResponse> {
  const res = await fetch(`${API_URL}/reports/overview-stats`, {
    credentials: "include",
  });
  return handleResponse<OverviewStatsResponse>(res);
}

export type DateRange = {
  start: string; // ISO date, e.g. "2026-09-01"
  end: string;
};

export type RangeSummaryResponse = {
  revenue: number;
  previousRevenue: number;
  orderCount: number;
  previousOrderCount: number;
  avgOrderValue: number;
  lowStockCount: number;
};

export async function fetchRangeSummary(range: DateRange): Promise<RangeSummaryResponse> {
  const params = new URLSearchParams({ start: range.start, end: range.end });
  const res = await fetch(`${API_URL}/reports/range-summary?${params}`, {
    credentials: "include",
  });
  return handleResponse<RangeSummaryResponse>(res);
}

export type InventoryRow = {
  id: string;
  name: string;
  stock: number;
  price: string;
  categoryName: string;
};

export async function fetchInventory(): Promise<InventoryRow[]> {
  const res = await fetch(`${API_URL}/reports/inventory`, {
    credentials: "include",
  });
  return handleResponse<InventoryRow[]>(res);
}

export type ExportType = "sales" | "inventory" | "both";

export async function downloadExport(type: ExportType, range: DateRange): Promise<void> {
  const params = new URLSearchParams({ type, start: range.start, end: range.end });
  const res = await fetch(`${API_URL}/reports/export?${params}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to generate export");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `jaaziel-report-${range.start}-to-${range.end}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
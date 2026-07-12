import { useQuery } from "@tanstack/react-query";
import { fetchLowStock, fetchSalesByCategory, fetchTodaySummary } from "@/lib/api/reports";

export function useLowStock(threshold = 5) {
  return useQuery({
    queryKey: ["admin", "reports", "low-stock", threshold],
    queryFn: () => fetchLowStock(threshold),
  });
}

export function useTodaySummary() {
  return useQuery({
    queryKey: ["admin", "reports", "today-summary"],
    queryFn: fetchTodaySummary,
  });
}

export function useSalesByCategory() {
  return useQuery({
    queryKey: ["admin", "reports", "sales-by-category"],
    queryFn: fetchSalesByCategory,
  });
}
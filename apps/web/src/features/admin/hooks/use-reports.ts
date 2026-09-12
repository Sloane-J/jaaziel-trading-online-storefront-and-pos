import { useMutation, useQuery } from "@tanstack/react-query";
import {
  type DateRange,
  downloadExport,
  type ExportType,
  fetchInventory,
  fetchLowStock,
  fetchOverviewStats,
  fetchRangeSummary,
  fetchSalesByCategory,
  fetchTodaySummary,
} from "@/lib/api/reports";

export function useOverviewStats() {
  return useQuery({
    queryKey: ["admin", "reports", "overview-stats"],
    queryFn: fetchOverviewStats,
  });
}

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

export function useRangeSummary(range: DateRange) {
  return useQuery({
    queryKey: ["admin", "reports", "range-summary", range.start, range.end],
    queryFn: () => fetchRangeSummary(range),
  });
}

export function useInventory() {
  return useQuery({
    queryKey: ["admin", "reports", "inventory"],
    queryFn: fetchInventory,
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({ type, range }: { type: ExportType; range: DateRange }) =>
      downloadExport(type, range),
  });
}
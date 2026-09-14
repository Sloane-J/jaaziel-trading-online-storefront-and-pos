import { useQuery } from "@tanstack/react-query";
import { fetchDataIntegrityReport } from "@/lib/api/superadmin-data-integrity";

export function useDataIntegrityReport() {
  return useQuery({
    queryKey: ["superadmin", "data-integrity"],
    queryFn: fetchDataIntegrityReport,
    // This report queries several tables and does live schema checks —
    // not something to refetch aggressively on every window focus.
    staleTime: 60_000,
  });
}
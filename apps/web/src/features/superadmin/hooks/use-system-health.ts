import { useQuery } from "@tanstack/react-query";
import { fetchSystemHealth } from "@/lib/api/superadmin-health";

export function useSystemHealth() {
  return useQuery({
    queryKey: ["superadmin", "system-health"],
    queryFn: fetchSystemHealth,
    // Health should feel live — refetch periodically while the page is open.
    refetchInterval: 30_000,
  });
}
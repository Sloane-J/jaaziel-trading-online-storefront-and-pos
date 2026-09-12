import { useQuery } from "@tanstack/react-query";
import { fetchActivityLogs } from "@/lib/api/activity-logs";

export function useActivityLogs() {
  return useQuery({
    queryKey: ["activity-logs"],
    queryFn: fetchActivityLogs,
  });
}
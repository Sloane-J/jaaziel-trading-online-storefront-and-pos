import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchPropertySubmission,
  fetchPropertySubmissions,
  updatePropertySubmissionStatus,
  type PropertySubmissionStatus,
} from "@/lib/api/admin-property-submissions";

export function usePropertySubmissions(status?: PropertySubmissionStatus) {
  return useQuery({
    queryKey: ["admin", "property-submissions", status ?? "all"],
    queryFn: () => fetchPropertySubmissions(status),
  });
}

export function usePropertySubmission(id: string) {
  return useQuery({
    queryKey: ["admin", "property-submissions", id],
    queryFn: () => fetchPropertySubmission(id),
    enabled: Boolean(id),
  });
}

export function useUpdatePropertySubmissionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      adminNotes,
    }: {
      id: string;
      status: "listed" | "declined";
      adminNotes?: string;
    }) => updatePropertySubmissionStatus(id, status, adminNotes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "property-submissions"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "property-submissions", variables.id],
      });
    },
  });
}
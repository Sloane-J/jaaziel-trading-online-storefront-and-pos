import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchPropertySubmission,
  fetchPropertySubmissions,
  updatePropertySubmissionStatus,
  type PropertySubmissionStatus,
  type UpdatePropertySubmissionStatusInput,
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
      input,
    }: {
      id: string;
      input: UpdatePropertySubmissionStatusInput;
    }) => updatePropertySubmissionStatus(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "property-submissions"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "property-submissions", variables.id],
      });
      // A "listed" submission creates a real product, so refresh the
      // admin products list too.
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
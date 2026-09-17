import { useMutation } from "@tanstack/react-query";
import { createPropertySubmission } from "@/lib/api/property-submissions";

export function useCreatePropertySubmission() {
  return useMutation({
    mutationFn: createPropertySubmission,
  });
}
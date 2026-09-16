import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchReturnDetail,
  fetchReturns,
  restoreReturnInventory,
  type UpdateReturnStatusInput,
  updateReturnStatus,
} from "@/lib/api/admin-returns";

export function useReturns() {
  return useQuery({
    queryKey: ["admin", "returns"],
    queryFn: fetchReturns,
  });
}

export function useReturnDetail(id: string) {
  return useQuery({
    queryKey: ["admin", "returns", id],
    queryFn: () => fetchReturnDetail(id),
    enabled: Boolean(id),
  });
}

export function useUpdateReturnStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateReturnStatusInput) => updateReturnStatus(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "returns"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "returns", id] });
    },
  });
}

export function useRestoreReturnInventory(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => restoreReturnInventory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "returns", id] });
    },
  });
}
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type CreateStaffInput,
  createStaff,
  fetchStaff,
  type UpdateStaffInput,
  updateStaff,
} from "@/lib/api/staff";

const STAFF_KEY = ["staff"] as const;

export function useStaff() {
  return useQuery({
    queryKey: STAFF_KEY,
    queryFn: fetchStaff,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateStaffInput) => createStaff(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAFF_KEY });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateStaffInput }) =>
      updateStaff(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAFF_KEY });
    },
  });
}
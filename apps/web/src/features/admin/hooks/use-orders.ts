import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchOrder,
  fetchOrders,
  type OrderStatus,
  updateOrderStatus,
} from "@/lib/api/orders";

export function useOrders(filters?: { status?: string; channel?: string }) {
  return useQuery({
    queryKey: ["admin", "orders", filters ?? {}],
    queryFn: () => fetchOrders(filters),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["admin", "order", id],
    queryFn: () => fetchOrder(id),
    enabled: Boolean(id),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "order", variables.id] });
    },
  });
}
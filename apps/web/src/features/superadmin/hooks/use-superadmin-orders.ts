import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  applyPaymentCorrection,
  fetchFlaggedOrders,
  searchOrder,
  updateOrderStatus,
  verifyPayment,
} from "@/lib/api/superadmin-orders";

export function useFlaggedOrders() {
  return useQuery({
    queryKey: ["superadmin", "orders", "flagged"],
    queryFn: fetchFlaggedOrders,
  });
}

export function useSearchOrder() {
  return useMutation({
    mutationFn: (query: string) => searchOrder(query),
  });
}

export function useVerifyPayment() {
  return useMutation({
    mutationFn: (orderId: string) => verifyPayment(orderId),
  });
}

export function useApplyPaymentCorrection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => applyPaymentCorrection(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin", "orders", "flagged"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin", "orders", "flagged"] });
    },
  });
}
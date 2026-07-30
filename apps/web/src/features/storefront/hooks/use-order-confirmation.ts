import { useQuery } from "@tanstack/react-query";
import { fetchOrderConfirmation } from "@/lib/api/orders";

export function useOrderConfirmation(id: string) {
  return useQuery({
    queryKey: ["order-confirmation", id],
    queryFn: () => fetchOrderConfirmation(id),
    enabled: Boolean(id),
  });
}
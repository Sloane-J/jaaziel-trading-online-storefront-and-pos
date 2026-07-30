import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type CheckoutInput, createCheckout } from "@/lib/api/checkout";

export function useCreateCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CheckoutInput) => createCheckout(input),
    onSuccess: () => {
      // Cart is cleared server-side on successful checkout; refresh the cached cart.
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
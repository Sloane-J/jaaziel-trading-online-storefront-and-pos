import { useMutation } from "@tanstack/react-query";
import { createReturn, lookupOrderForReturn } from "@/lib/api/returns";

export function useLookupOrderForReturn() {
  return useMutation({
    mutationFn: ({ orderCode, phone }: { orderCode: string; phone: string }) =>
      lookupOrderForReturn(orderCode, phone),
  });
}

export function useCreateReturn() {
  return useMutation({
    mutationFn: createReturn,
  });
}
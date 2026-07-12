import { useMutation, useQuery } from "@tanstack/react-query";
import { type CreateSaleInput, createSale, fetchNextOrderNumber, fetchPosCatalog } from "@/lib/api/pos";

export function usePosCatalog() {
  return useQuery({
    queryKey: ["pos", "catalog"],
    queryFn: fetchPosCatalog,
  });
}

export function useNextOrderNumber() {
  return useQuery({
    queryKey: ["pos", "next-order-number"],
    queryFn: fetchNextOrderNumber,
  });
}

export function useCreateSale() {
  return useMutation({
    mutationFn: (input: CreateSaleInput) => createSale(input),
  });
}
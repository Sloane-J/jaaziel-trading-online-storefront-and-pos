import { useMutation, useQuery } from "@tanstack/react-query";
import { type CreateSaleInput, createSale, fetchPosCatalog } from "@/lib/api/pos";

export function usePosCatalog() {
  return useQuery({
    queryKey: ["pos", "catalog"],
    queryFn: fetchPosCatalog,
  });
}

export function useCreateSale() {
  return useMutation({
    mutationFn: (input: CreateSaleInput) => createSale(input),
  });
}
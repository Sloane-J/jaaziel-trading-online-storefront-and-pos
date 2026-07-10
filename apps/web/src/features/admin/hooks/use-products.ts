import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	activateProduct,
	type CreateProductInput,
	createProduct,
	deactivateProduct,
	fetchAllProductsAdmin,
	type UpdateProductInput,
	updateProduct,
} from "@/lib/api/products";

const PRODUCTS_KEY = ["products"] as const;

export function useProducts() {
	return useQuery({
		queryKey: PRODUCTS_KEY,
		queryFn: fetchAllProductsAdmin,
	});
}

export function useCreateProduct() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateProductInput) => createProduct(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
		},
	});
}

export function useUpdateProduct() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateProductInput }) =>
			updateProduct(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
		},
	});
}

export function useDeactivateProduct() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deactivateProduct(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
		},
	});
}

export function useActivateProduct() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => activateProduct(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
		},
	});
}

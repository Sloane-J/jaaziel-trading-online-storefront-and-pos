import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	addCartItem,
	fetchCart,
	mergeGuestCart,
	removeCartItem,
	updateCartItem,
} from "@/lib/api/cart";

const CART_KEY = ["cart"] as const;

export function useCart() {
	return useQuery({
		queryKey: CART_KEY,
		queryFn: fetchCart,
	});
}

export function useAddCartItem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			productId,
			quantity,
		}: {
			productId: string;
			quantity?: number;
		}) => addCartItem(productId, quantity),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CART_KEY });
		},
	});
}

export function useUpdateCartItem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
			updateCartItem(id, quantity),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CART_KEY });
		},
	});
}

export function useRemoveCartItem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => removeCartItem(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CART_KEY });
		},
	});
}

export function useMergeGuestCart() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: mergeGuestCart,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CART_KEY });
		},
	});
}

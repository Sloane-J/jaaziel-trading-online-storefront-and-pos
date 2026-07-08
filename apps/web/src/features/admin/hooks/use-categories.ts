import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type CreateCategoryInput,
	createCategory,
	deactivateCategory,
	fetchCategories,
	type UpdateCategoryInput,
	updateCategory,
} from "@/lib/api/categories";

const CATEGORIES_KEY = ["categories"] as const;

export function useCategories() {
	return useQuery({
		queryKey: CATEGORIES_KEY,
		queryFn: fetchCategories,
	});
}

export function useCreateCategory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateCategoryInput) => createCategory(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
		},
	});
}

export function useUpdateCategory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
			updateCategory(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
		},
	});
}

export function useDeactivateCategory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deactivateCategory(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
		},
	});
}

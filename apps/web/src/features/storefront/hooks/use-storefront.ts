import { useQuery } from "@tanstack/react-query";
import {
	fetchCategoriesPreview,
	fetchCategoryBySlug,
	fetchPublicCategories,
	fetchPublicProduct,
	fetchPublicProducts,
	fetchStorefrontHome,
} from "@/lib/api/storefront";

export function useStorefrontHome() {
	return useQuery({
		queryKey: ["storefront", "home"],
		queryFn: fetchStorefrontHome,
	});
}

export function usePublicCategories() {
	return useQuery({
		queryKey: ["storefront", "categories"],
		queryFn: fetchPublicCategories,
	});
}

export function useCategoryBySlug(slug: string) {
	return useQuery({
		queryKey: ["storefront", "category", slug],
		queryFn: () => fetchCategoryBySlug(slug),
		enabled: Boolean(slug),
	});
}

export function usePublicProducts(categoryId?: string) {
	return useQuery({
		queryKey: ["storefront", "products", categoryId ?? "all"],
		queryFn: () => fetchPublicProducts(categoryId),
	});
}

export function usePublicProduct(id: string) {
	return useQuery({
		queryKey: ["storefront", "product", id],
		queryFn: () => fetchPublicProduct(id),
		enabled: Boolean(id),
	});
}

export function useCategoriesPreview() {
	return useQuery({
		queryKey: ["storefront", "categories-preview"],
		queryFn: fetchCategoriesPreview,
	});
}

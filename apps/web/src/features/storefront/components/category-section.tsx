import { ChevronRightIcon } from "lucide-react";
import { Link } from "react-router";
import { ProductCard } from "@/features/storefront/components/product-card";
import type { Category } from "@/lib/api/categories";
import type { Product } from "@/lib/api/products";

type CategorySectionProps = {
	category: Category;
	products: Product[];
};

export function CategorySection({ category, products }: CategorySectionProps) {
	if (products.length === 0) return null;

	return (
		<section className="mx-auto max-w-[1600px] px-6 py-8">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="font-heading text-xl font-semibold text-foreground">
					{category.name}
				</h2>
				<Link
					to={`/shop/${category.slug}`}
					className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
				>
					See all
					<ChevronRightIcon className="size-4" />
				</Link>
			</div>

			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{products.map((product) => (
					<ProductCard key={product.id} product={product} />
				))}
			</div>
		</section>
	);
}

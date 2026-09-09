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
		<div className="mb-5 flex items-end justify-between gap-4">
			<div>
				<h2 className="font-heading text-xl font-semibold text-primary sm:text-2xl">
					{category.name}
				</h2>
				<span className="mt-1 block h-0.5 w-10 rounded-full bg-primary/40" />
			</div>
			<Link
				to={`/shop/${category.slug}`}
				className="group flex shrink-0 items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-95"
			>
				See all
				<ChevronRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
			</Link>
		</div>

			<div className="grid grid-flow-col auto-cols-[42%] items-start gap-3 overflow-x-auto pb-1 [scrollbar-width:none] sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-3 sm:items-stretch sm:overflow-visible sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 [&::-webkit-scrollbar]:hidden">
				{products.map((product) => (
					<ProductCard key={product.id} product={product} />
				))}
			</div>
		</section>
	);
}
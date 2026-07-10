import { ShoppingCartIcon } from "lucide-react";
import { Link } from "react-router";
import type { Product } from "@/lib/api/products";

function formatPrice(price: string): string {
	return `GHS ${Number(price).toFixed(2)}`;
}

type ProductCardProps = {
	product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
	const isOutOfStock = product.stock === 0;

	return (
		<Link
			to={`/products/${product.id}`}
			className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
		>
			<div className="aspect-square w-full overflow-hidden border-b border-border bg-muted">
				{product.images[0] ? (
					<img
						src={product.images[0]}
						alt={product.name}
						className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
					/>
				) : (
					<div className="size-full bg-muted" />
				)}
			</div>

			<div className="space-y-1 p-4">
				<p className="truncate font-heading text-base font-semibold text-foreground">
					{product.name}
				</p>
				<div className="flex items-center justify-between pt-1">
					<p className="text-sm font-semibold text-foreground">
						{formatPrice(product.price)}
					</p>

					{isOutOfStock ? (
						<span className="text-xs font-medium text-destructive">
							Out of stock
						</span>
					) : (
						<span
							className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105"
						>
							<ShoppingCartIcon className="size-4" />
						</span>
					)}
				</div>
			</div>
		</Link>
	);
}

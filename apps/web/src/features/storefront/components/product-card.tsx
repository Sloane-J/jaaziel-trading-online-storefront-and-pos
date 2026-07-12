import { ShoppingCartIcon } from "lucide-react";
import { Link } from "react-router";
import { useAddCartItem } from "@/features/storefront/hooks/use-cart";
import type { Product } from "@/lib/api/products";
import { formatPrice } from "@/lib/format-price";

type ProductCardProps = {
	product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
	const addCartItem = useAddCartItem();
	const isOutOfStock = product.stock === 0;

	function handleAddToCart(e: React.MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		addCartItem.mutate({ productId: product.id });
	}

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

			<div className="space-y-1 p-3">
				<p className="truncate font-heading text-sm font-semibold text-foreground">
					{product.name}
				</p>
				<div className="flex items-center justify-between pt-0.5">
					<p className="text-sm font-semibold text-foreground">
						{formatPrice(product.price)}
					</p>

					{isOutOfStock ? (
						<span className="text-xs font-medium text-destructive">
							Out of stock
						</span>
					) : (
						<button
							type="button"
							onClick={handleAddToCart}
							disabled={addCartItem.isPending}
							aria-label="Add to cart"
							className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-110 active:scale-95 disabled:opacity-60"
						>
							<ShoppingCartIcon className="size-3.5" />
						</button>
					)}
				</div>
			</div>
		</Link>
	);
}

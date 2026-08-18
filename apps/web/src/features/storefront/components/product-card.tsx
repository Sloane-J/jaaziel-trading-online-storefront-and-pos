import { Link } from "react-router";
import type { Product } from "@/lib/api/products";
import { formatPrice } from "@/lib/format-price";
import { getImageUrl } from "@/lib/get-image-url";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;

  return (
    <Link to={`/products/${product.id}`} className="group flex flex-col">
      <div className="aspect-square w-full overflow-hidden rounded-xl border border-border bg-card transition-shadow group-hover:shadow-md">
        {product.images[0] ? (
          <img
            src={getImageUrl(product.images[0], { width: 500 })}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="size-full bg-muted" />
        )}
      </div>
      <div className="space-y-1 pt-2.5">
        <p className="line-clamp-2 text-sm text-foreground">
          {product.name}
        </p>
        <p className="text-sm font-semibold text-foreground">
          {formatPrice(product.price)}
        </p>
        {isOutOfStock && (
          <p className="text-xs font-medium text-destructive">
            Out of stock
          </p>
        )}
      </div>
    </Link>
  );
}
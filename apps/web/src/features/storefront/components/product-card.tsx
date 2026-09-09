import { HeartIcon } from "lucide-react";
import { Link } from "react-router";
import type { Product } from "@/lib/api/products";
import { formatPrice } from "@/lib/format-price";
import { getImageUrl } from "@/lib/get-image-url";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;

  function handleWishlistClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    // TODO: wire up once customer accounts/wishlist exist.
  }

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col transition-transform duration-150 active:scale-[0.98]"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-card transition-shadow group-hover:shadow-md">
        {product.images[0] ? (
          <img
            src={getImageUrl(product.images[0], { width: 500 })}
            alt={product.name}
            loading="lazy"
            className={`size-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              isOutOfStock ? "opacity-60 grayscale" : ""
            }`}
          />
        ) : (
          <div className="size-full bg-muted" />
        )}

        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label="Add to wishlist"
          className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-destructive"
        >
          <HeartIcon className="size-4" />
        </button>

        {isOutOfStock && (
          <span className="absolute bottom-2 left-2 rounded-full bg-foreground/90 px-2.5 py-1 text-xs font-medium text-background">
            Out of stock
          </span>
        )}
      </div>
      <div className="space-y-1 pt-2.5">
        <p className="line-clamp-2 text-sm font-normal leading-snug text-foreground">
          {product.name}
        </p>
        <p className="text-md font-black text-primary">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
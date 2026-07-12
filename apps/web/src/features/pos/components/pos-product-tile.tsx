import { MinusIcon, PlusIcon } from "lucide-react";
import type { Product } from "@/lib/api/products";
import { formatPrice } from "@/lib/format-price";

type PosProductTileProps = {
  product: Product;
  quantityInCart: number;
  onAdd: () => void;
  onRemove: () => void;
};

export function PosProductTile({ product, quantityInCart, onAdd, onRemove }: PosProductTileProps) {
  const isOutOfStock = product.stock === 0;

  function handleCardActivate() {
    if (!isOutOfStock) onAdd();
  }

  function handleCardKeyDown(e: React.KeyboardEvent) {
    if ((e.key === "Enter" || e.key === " ") && !isOutOfStock) {
      e.preventDefault();
      onAdd();
    }
  }

  return (
    <div
      role="button"
      tabIndex={isOutOfStock ? -1 : 0}
      onClick={handleCardActivate}
      onKeyDown={handleCardKeyDown}
      aria-disabled={isOutOfStock}
      aria-label={`${product.name}, ${formatPrice(product.price)}, ${
        isOutOfStock ? "out of stock" : `${product.stock} in stock`
      }`}
      className={`flex flex-col justify-between gap-2 rounded-xl border border-border bg-card p-3 text-left transition-colors ${
        isOutOfStock
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
      }`}
    >
      <div>
        <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
        <p className="text-xs text-muted-foreground">{product.stock} in stock</p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{formatPrice(product.price)}</p>

        {isOutOfStock ? (
          <span className="text-xs font-medium text-destructive">Out of stock</span>
        ) : quantityInCart === 0 ? (
          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <PlusIcon className="size-3.5" />
          </span>
        ) : (
          <div
            className="flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Decrease ${product.name} quantity`}
              className="flex size-6 items-center justify-center rounded-full border border-border transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <MinusIcon className="size-3" />
            </button>
            <span className="w-4 text-center text-sm font-medium" aria-live="polite">
              {quantityInCart}
            </span>
            <button
              type="button"
              onClick={onAdd}
              disabled={quantityInCart >= product.stock}
              aria-label={`Increase ${product.name} quantity`}
              className="flex size-6 items-center justify-center rounded-full border border-border transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
            >
              <PlusIcon className="size-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
import { MinusIcon, PlusIcon } from "lucide-react";
import type { Product } from "@/lib/api/products";

function formatPrice(price: string): string {
  return `GHS ${Number(price).toFixed(2)}`;
}

type PosProductTileProps = {
  product: Product;
  quantityInCart: number;
  onAdd: () => void;
  onRemove: () => void;
};

export function PosProductTile({ product, quantityInCart, onAdd, onRemove }: PosProductTileProps) {
  const isOutOfStock = product.stock === 0;

  return (
    <div className="flex flex-col justify-between gap-2 rounded-xl border border-border bg-card p-3">
      <div>
        <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
        <p className="text-xs text-muted-foreground">{product.stock} in stock</p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{formatPrice(product.price)}</p>

        {isOutOfStock ? (
          <span className="text-xs font-medium text-destructive">Out of stock</span>
        ) : quantityInCart === 0 ? (
          <button
            type="button"
            onClick={onAdd}
            aria-label={`Add ${product.name}`}
            className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-110 active:scale-95"
          >
            <PlusIcon className="size-3.5" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Decrease ${product.name}`}
              className="flex size-6 items-center justify-center rounded-full border border-border transition-colors hover:bg-accent"
            >
              <MinusIcon className="size-3" />
            </button>
            <span className="w-4 text-center text-sm font-medium">{quantityInCart}</span>
            <button
              type="button"
              onClick={onAdd}
              disabled={quantityInCart >= product.stock}
              aria-label={`Increase ${product.name}`}
              className="flex size-6 items-center justify-center rounded-full border border-border transition-colors hover:bg-accent disabled:opacity-40"
            >
              <PlusIcon className="size-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
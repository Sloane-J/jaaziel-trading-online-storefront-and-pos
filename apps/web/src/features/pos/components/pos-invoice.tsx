import { MinusIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PosCartItem } from "@/features/pos/hooks/use-pos-cart";

function formatPrice(amount: number): string {
  return `GHS ${amount.toFixed(2)}`;
}

type PosInvoiceProps = {
  orderNumber: string;
  items: PosCartItem[];
  subtotal: number;
  onAdd: (productId: string) => void;
  onRemove: (productId: string) => void;
  onDelete: (productId: string) => void;
  onClearSale: () => void;
  onPlaceOrder: () => void;
  isSubmitting: boolean;
};

export function PosInvoice({
  orderNumber,
  items,
  subtotal,
  onAdd,
  onRemove,
  onDelete,
  onClearSale,
  onPlaceOrder,
  isSubmitting,
}: PosInvoiceProps) {
  const discount = 0;
  const tax = 0;
  const total = subtotal - discount + tax;

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Order
          </p>
          <p className="font-heading text-lg font-semibold text-foreground">
            {orderNumber}
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={onClearSale}
            aria-label="Clear order"
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <XIcon className="size-3.5" />
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 space-y-3 overflow-y-auto px-4 py-3">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No items added yet.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {item.product.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} × {formatPrice(Number(item.product.price))}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onRemove(item.product.id)}
                  aria-label={`Decrease ${item.product.name}`}
                  className="flex size-6 items-center justify-center rounded-full border border-border transition-colors hover:bg-accent"
                >
                  <MinusIcon className="size-3" />
                </button>
                <span className="w-4 text-center text-sm">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => onAdd(item.product.id)}
                  aria-label={`Increase ${item.product.name}`}
                  className="flex size-6 items-center justify-center rounded-full border border-border transition-colors hover:bg-accent"
                >
                  <PlusIcon className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.product.id)}
                  aria-label={`Remove ${item.product.name}`}
                  className="ml-1 text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2Icon className="size-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-1.5 border-t border-border px-4 py-3 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Discount</span>
          <span>{formatPrice(discount)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Tax</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-1.5 text-base font-semibold text-foreground">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <div className="px-4 pb-4">
        <Button
          size="lg"
          className="w-full"
          disabled={items.length === 0 || isSubmitting}
          onClick={onPlaceOrder}
        >
          {isSubmitting ? "Placing order..." : "Place order"}
        </Button>
      </div>
    </div>
  );
}

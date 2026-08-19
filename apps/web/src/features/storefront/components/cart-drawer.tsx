import {
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  TrashIcon,
  ArrowRightIcon,
} from "lucide-react";
import { Link } from "react-router";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/features/storefront/hooks/use-cart";
import { formatPrice } from "@/lib/format-price";
import { getImageUrl } from "@/lib/get-image-url";

type CartDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { data, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  const items = data?.items ?? [];

  const total = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        {/* Header */}
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="flex items-center gap-2 font-heading text-lg">
            <ShoppingBagIcon className="size-5" />
            Your cart
            {!isLoading && itemCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({itemCount} {itemCount === 1 ? "item" : "items"})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Loading */}
        {isLoading ? (
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="size-20 shrink-0 animate-pulse rounded-xl bg-muted" />

                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                  <div className="mt-auto h-7 w-24 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          /* Empty Cart */
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBagIcon className="size-7 text-muted-foreground" />
            </div>

            <h3 className="font-heading text-lg font-semibold text-foreground">
              Your cart is empty
            </h3>

            <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Looks like you haven't added anything to your cart yet.
            </p>

            <Link
              to="/"
              onClick={() => onOpenChange(false)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Continue shopping
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-border px-5">
                {items.map((item) => {
                  const itemTotal =
                    Number(item.product.price) * item.quantity;

                  return (
                    <div key={item.id} className="flex gap-4 py-5">
                      {/* Product Image */}
                      <div className="size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                        {item.product.images[0] ? (
                          <img
                            src={getImageUrl(item.product.images[0], {
                              width: 200,
                            })}
                            alt={item.product.name}
                            loading="lazy"
                            className="block size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <ShoppingBagIcon className="size-6 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                            {item.product.name}
                          </p>

                          <button
                            type="button"
                            onClick={() => removeItem.mutate(item.id)}
                            disabled={removeItem.isPending}
                            aria-label={`Remove ${item.product.name}`}
                            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive disabled:opacity-50"
                          >
                            <TrashIcon className="size-4" />
                          </button>
                        </div>

                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {formatPrice(Number(item.product.price))}
                        </p>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          {/* Quantity */}
                          <div className="inline-flex items-center rounded-lg border border-border bg-background">
                            <button
                              type="button"
                              onClick={() =>
                                item.quantity > 1
                                  ? updateItem.mutate({
                                      id: item.id,
                                      quantity: item.quantity - 1,
                                    })
                                  : removeItem.mutate(item.id)
                              }
                              disabled={
                                updateItem.isPending || removeItem.isPending
                              }
                              aria-label="Decrease quantity"
                              className="flex size-8 items-center justify-center rounded-l-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                            >
                              <MinusIcon className="size-3.5" />
                            </button>

                            <span className="flex min-w-8 items-center justify-center text-sm font-medium text-foreground">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateItem.mutate({
                                  id: item.id,
                                  quantity: item.quantity + 1,
                                })
                              }
                              disabled={updateItem.isPending}
                              aria-label="Increase quantity"
                              className="flex size-8 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                            >
                              <PlusIcon className="size-3.5" />
                            </button>
                          </div>

                          {/* Item Total */}
                          <span className="text-sm font-semibold text-foreground">
                            {formatPrice(itemTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="border-t border-border bg-background px-5 pb-5 pt-4">
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-xs">Calculated at checkout</span>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3 text-base font-bold text-foreground">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                onClick={() => onOpenChange(false)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Proceed to checkout
                <ArrowRightIcon className="size-4" />
              </Link>

              <Link
                to="/"
                onClick={() => onOpenChange(false)}
                className="mt-3 block text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Continue shopping
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
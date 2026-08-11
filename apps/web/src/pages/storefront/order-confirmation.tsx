import { CheckCircle2Icon } from "lucide-react";
import { Link, useParams } from "react-router";
import { StorefrontLayout } from "@/components/shared/storefront-layout";
import { useOrderConfirmation } from "@/features/storefront/hooks/use-order-confirmation";
import { formatPrice } from "@/lib/format-price";

export function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useOrderConfirmation(id ?? "");

  if (isLoading) {
    return (
      <StorefrontLayout>
        <div className="mx-auto max-w-[1600px] px-6 py-24 text-center">
          <p className="text-muted-foreground">Loading your order…</p>
        </div>
      </StorefrontLayout>
    );
  }

  if (isError || !data) {
    return (
      <StorefrontLayout>
        <div className="mx-auto max-w-[1600px] px-6 py-24 text-center">
          <p className="text-lg font-medium text-foreground">Order not found</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Continue shopping
          </Link>
        </div>
      </StorefrontLayout>
    );
  }

  const { order, items } = data;

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-xl px-6 py-16">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <CheckCircle2Icon className="size-12 text-primary" />
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Thanks for your order!
          </h1>
          <p className="text-muted-foreground">
            Order confirmation:{" "}
            <span className="font-mono text-sm text-foreground">{order.id.slice(0, 8)}</span>
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-foreground">
                  {item.productName} × {item.quantity}
                </span>
                <span className="text-foreground">
                  {formatPrice(Number(item.unitPrice) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-1 border-t border-border pt-3 text-sm">
            <div className="flex justify-between font-semibold text-foreground">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Fulfillment</span>
              <span>
                {order.fulfillmentType === "delivery" ? "Delivery" : "Pickup in-store"}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Status</span>
              <span className="capitalize">{order.status}</span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          We'll be in touch shortly to confirm your order.
        </p>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </StorefrontLayout>
  );
}
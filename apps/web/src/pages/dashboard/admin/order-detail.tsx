import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useOrder,
  useUpdateOrderStatus,
} from "@/features/admin/hooks/use-orders";
import type { OrderStatus } from "@/lib/api/orders";
import { formatPrice } from "@/lib/format-price";
import { adminNavItems } from "@/pages/dashboard/admin/nav-items";

const STATUS_BADGE_VARIANT: Record
  OrderStatus,
  "default" | "secondary" | "destructive"
> = {
  pending: "secondary",
  confirmed: "secondary",
  packed: "secondary",
  out_for_delivery: "secondary",
  completed: "default",
  cancelled: "destructive",
};

// The next logical status for an online order moving through fulfillment.
const NEXT_STATUS: Partial
  Record<OrderStatus, { status: OrderStatus; label: string }>
> = {
  pending: { status: "confirmed", label: "Confirm order" },
  confirmed: { status: "packed", label: "Mark as packed" },
  packed: { status: "out_for_delivery", label: "Mark out for delivery" },
  out_for_delivery: { status: "completed", label: "Mark as completed" },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function AdminOrderDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error } = useOrder(id ?? "");
  const updateStatus = useUpdateOrderStatus();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const nextAction = data ? NEXT_STATUS[data.order.status] : undefined;
  const canCancel =
    data &&
    data.order.status !== "completed" &&
    data.order.status !== "cancelled";

  async function handleAdvance() {
    if (!data || !nextAction) return;
    await updateStatus.mutateAsync({
      id: data.order.id,
      status: nextAction.status,
    });
  }

  async function handleCancel() {
    if (!data) return;
    await updateStatus.mutateAsync({ id: data.order.id, status: "cancelled" });
    setCancelDialogOpen(false);
  }

  return (
    <DashboardLayout title="Jaaziel Admin" navItems={adminNavItems}>
      <div className="space-y-5">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Back to orders
        </Link>

        {isLoading ? (
          <p className="text-muted-foreground">Loading order…</p>
        ) : isError || !data ? (
          <p role="alert" className="text-destructive">
            Couldn't load this order:{" "}
            {error instanceof Error ? error.message : "Not found"}
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Order
                </p>
                <p className="font-heading text-xl font-semibold text-foreground">
                  {data.order.id.slice(0, 8)}
                </p>
              </div>
              <Badge
                variant={STATUS_BADGE_VARIANT[data.order.status]}
                className="text-sm"
              >
                {data.order.status.replace(/_/g, " ")}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
              {/* Items */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Items
                </h3>
                <div className="space-y-3">
                  {data.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {item.productName}
                        </p>
                        <p className="text-muted-foreground">
                          {item.quantity} × {formatPrice(item.unitPrice)}
                        </p>
                      </div>
                      <p className="font-medium text-foreground">
                        {formatPrice(Number(item.unitPrice) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                {data.order.fulfillmentType === "delivery" && (
                  <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm">
                    <span className="text-muted-foreground">Delivery fee</span>
                    <span className="text-foreground">
                      {formatPrice(data.order.deliveryFee)}
                    </span>
                  </div>
                )}
                <div className="mt-4 flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
                  <span>Total</span>
                  <span>{formatPrice(data.order.totalAmount)}</span>
                </div>
              </div>

              {/* Order info + actions */}
              <div className="space-y-4">
                <div className="space-y-2 rounded-2xl border border-border bg-card p-5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Channel</span>
                    <span className="text-foreground">
                      {data.order.channel === "in_store"
                        ? "In-store"
                        : "Online"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fulfillment</span>
                    <span className="text-foreground">
                      {data.order.fulfillmentType === "pickup_in_store"
                        ? "Pickup / in-store"
                        : "Delivery"}
                    </span>
                  </div>
                  {data.order.fulfillmentType === "delivery" && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery fee</span>
                      <span className="text-foreground">
                        {formatPrice(data.order.deliveryFee)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment</span>
                    <span className="text-foreground capitalize">
                      {data.order.paymentStatus}
                      {data.order.paymentMethod &&
                        ` · ${data.order.paymentMethod.replace("_", " ")}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Placed</span>
                    <span className="text-foreground">
                      {formatDate(data.order.createdAt)}
                    </span>
                  </div>
                </div>

                {(nextAction || canCancel) && (
                  <div className="space-y-2">
                    {nextAction && (
                      <Button
                        size="lg"
                        className="w-full"
                        disabled={updateStatus.isPending}
                        onClick={handleAdvance}
                      >
                        {nextAction.label}
                      </Button>
                    )}
                    {canCancel && (
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setCancelDialogOpen(true)}
                      >
                        Cancel order
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
              <AlertDialogDescription>
                This marks the order as cancelled. Note: stock is not
                automatically restored yet — that's a future improvement once
                returns are properly supported.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep order</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancel}>
                Cancel order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
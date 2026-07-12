import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "@/features/admin/hooks/use-orders";
import type { OrderStatus } from "@/lib/api/orders";
import { formatPrice } from "@/lib/format-price";

const STATUS_BADGE_VARIANT: Record<OrderStatus, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  confirmed: "secondary",
  packed: "secondary",
  out_for_delivery: "secondary",
  completed: "default",
  cancelled: "destructive",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GH", { month: "short", day: "numeric" });
}

export function RecentOrders() {
  const { data: orders, isLoading } = useOrders();
  const recent = (orders ?? []).slice(0, 6);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Recent orders
        </h3>
        <Link to="/admin/orders" className="text-xs font-medium text-primary hover:underline">
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="space-y-1">
          {recent.map((order) => (
            <Link
              key={order.id}
              to={`/admin/orders/${order.id}`}
              className="flex items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {order.id.slice(0, 8)}
                </span>
                <Badge variant={STATUS_BADGE_VARIANT[order.status]} className="text-[10px]">
                  {order.status.replace(/_/g, " ")}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">{formatDate(order.createdAt)}</span>
                <span className="font-medium text-foreground">{formatPrice(order.totalAmount)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
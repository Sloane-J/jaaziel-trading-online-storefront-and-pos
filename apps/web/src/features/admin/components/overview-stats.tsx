import { AlertTriangleIcon } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { useLowStock, useTodaySummary } from "@/features/admin/hooks/use-reports";
import { formatPrice } from "@/lib/format-price";

export function OverviewStats() {
  const { data: summary, isLoading: summaryLoading } = useTodaySummary();
  const { data: lowStock, isLoading: lowStockLoading } = useLowStock();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Today's sales
        </p>
        {summaryLoading ? (
          <div className="mt-2 h-9 w-32 animate-pulse rounded bg-muted" />
        ) : (
          <>
            <p className="mt-1 font-heading text-3xl font-bold text-foreground">
              {formatPrice(summary?.revenue ?? 0)}
            </p>
            <p className="text-sm text-muted-foreground">
              {summary?.orderCount ?? 0} order{summary?.orderCount === 1 ? "" : "s"}
            </p>
          </>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-2 flex items-center gap-1.5">
          <AlertTriangleIcon className="size-4 text-muted-foreground" />
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Low stock
          </p>
        </div>

        {lowStockLoading ? (
          <div className="h-16 animate-pulse rounded bg-muted" />
        ) : lowStock && lowStock.length > 0 ? (
          <div className="space-y-1.5">
            {lowStock.slice(0, 4).map((product) => (
              <div key={product.id} className="flex items-center justify-between text-sm">
                <span className="truncate text-foreground">{product.name}</span>
                <Badge variant={product.stock === 0 ? "destructive" : "secondary"}>
                  {product.stock === 0 ? "Out of stock" : `${product.stock} left`}
                </Badge>
              </div>
            ))}
            {lowStock.length > 4 && (
              <Link
                to="/admin/products"
                className="block pt-1 text-xs font-medium text-primary hover:underline"
              >
                View all {lowStock.length} low-stock items
              </Link>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">All products are well stocked.</p>
        )}
      </div>
    </div>
  );
}
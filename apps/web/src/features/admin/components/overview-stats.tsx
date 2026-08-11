
import { PackageXIcon, ReceiptTextIcon, ShoppingBagIcon, TrendingDownIcon, TrendingUpIcon, TruckIcon, WalletIcon } from "lucide-react";
import { Link } from "react-router";
import { useOverviewStats } from "@/features/admin/hooks/use-reports";
import { formatPrice } from "@/lib/format-price";

function calculateTrend(current: number, previous: number): { percent: number; direction: "up" | "down" } | null {
  if (previous === 0) return null;
  const percent = ((current - previous) / previous) * 100;
  return { percent: Math.abs(percent), direction: percent >= 0 ? "up" : "down" };
}

function TrendBadge({ trend }: { trend: { percent: number; direction: "up" | "down" } | null }) {
  if (!trend) return null;

  const isUp = trend.direction === "up";
  const Icon = isUp ? TrendingUpIcon : TrendingDownIcon;

  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-medium ${
        isUp ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
      }`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {trend.percent.toFixed(1)}%
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend = null,
  loading,
  as: Component = "div",
  ...rest
}: {
  icon: typeof WalletIcon;
  label: string;
  value: string;
  trend?: { percent: number; direction: "up" | "down" } | null;
  loading: boolean;
  as?: "div" | typeof Link;
  to?: string;
}) {
  const content = (
    <>
      <div className="mb-2 flex items-center gap-1.5">
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      </div>

      {loading ? (
        <div className="h-7 w-24 animate-pulse rounded bg-muted" />
      ) : (
        <div className="flex items-end justify-between gap-2">
          <p className="font-sans font-bold text-foreground">{value}</p>
          <TrendBadge trend={trend} />
        </div>
      )}
    </>
  );

  const classes = "rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md";

  if (Component === Link) {
    return (
      <Link to={rest.to as string} className={classes}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}

export function OverviewStats() {
  const { data, isLoading, isError } = useOverviewStats();

  if (isError) {
    return (
      <div className="rounded-2xl border border-destructive/50 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive">Failed to load stats. Try refreshing.</p>
      </div>
    );
  }

  const salesTrend = data ? calculateTrend(data.todaysSales, data.yesterdaysSales) : null;
  const ordersTrend = data ? calculateTrend(data.todaysOrderCount, data.yesterdaysOrderCount) : null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={WalletIcon}
        label="Total Revenue"
        value={formatPrice(data?.grossSales ?? 0)}
        loading={isLoading}
      />

      <StatCard
              icon={TruckIcon}
              label="Delivery revenue"
              value={formatPrice(data?.deliveryRevenue ?? 0)}
              loading={isLoading}
            />

      <StatCard
        icon={ReceiptTextIcon}
        label="Today's Sales"
        value={formatPrice(data?.todaysSales ?? 0)}
        trend={salesTrend}
        loading={isLoading}
      />

      <StatCard
        icon={ShoppingBagIcon}
        label="Today's Orders"
        value={String(data?.todaysOrderCount ?? 0)}
        trend={ordersTrend}
        loading={isLoading}
      />

      <StatCard
        as={Link}
        to="/admin/products"
        icon={PackageXIcon}
        label="Low Stock"
        value={String(data?.lowStockCount ?? 0)}
        loading={isLoading}
      />
    </div>
  );
}
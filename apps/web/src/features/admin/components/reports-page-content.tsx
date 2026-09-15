import {
  DownloadIcon,
  PackageXIcon,
  ReceiptTextIcon,
  SearchIcon,
  ShoppingBagIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";
import { useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DateRangePicker } from "@/features/admin/components/date-range-picker";
import {
  useExportReport,
  useInventory,
  useRangeSummary,
  useSalesByCategory,
} from "@/features/admin/hooks/use-reports";
import type { DateRange, ExportType } from "@/lib/api/reports";
import { formatPrice } from "@/lib/format-price";

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function calculateTrend(
  current: number,
  previous: number,
): { percent: number; direction: "up" | "down" } | null {
  if (previous === 0) return null;
  const percent = ((current - previous) / previous) * 100;
  return { percent: Math.abs(percent), direction: percent >= 0 ? "up" : "down" };
}

function TrendBadge({
  trend,
}: {
  trend: { percent: number; direction: "up" | "down" } | null;
}) {
  if (!trend) return null;

  const isUp = trend.direction === "up";
  const Icon = isUp ? TrendingUpIcon : TrendingDownIcon;

  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-medium ${
        isUp ? "text-success" : "text-destructive"
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
}: {
  icon: typeof WalletIcon;
  label: string;
  value: string;
  trend?: { percent: number; direction: "up" | "down" } | null;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
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
          <p className="font-sans text-xl font-bold text-foreground">{value}</p>
          <TrendBadge trend={trend} />
        </div>
      )}
    </div>
  );
}

export function ReportsPageContent() {
  const [range, setRange] = useState<DateRange>({
    start: toISODate(daysAgo(6)),
    end: toISODate(new Date()),
  });
  const [activePreset, setActivePreset] = useState<string | null>("7 days");
  const [searchQuery, setSearchQuery] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportType, setExportType] = useState<ExportType>("both");

  const { data: summary, isLoading: summaryLoading } = useRangeSummary(range);
  const { data: salesData, isLoading: salesLoading } = useSalesByCategory();
  const { data: inventory, isLoading: inventoryLoading } = useInventory();
  const exportReport = useExportReport();

  const revenueTrend = summary
    ? calculateTrend(summary.revenue, summary.previousRevenue)
    : null;
  const ordersTrend = summary
    ? calculateTrend(summary.orderCount, summary.previousOrderCount)
    : null;

  const chartData = (salesData?.days ?? []).map((day) => {
    const total = (salesData?.categories ?? []).reduce(
      (sum, cat) => sum + (Number(day[cat]) || 0),
      0,
    );
    return { date: day.date, total };
  });

  const filteredInventory = (() => {
    if (!inventory) return inventory;
    if (!searchQuery.trim()) return inventory;
    const q = searchQuery.trim().toLowerCase();
    return inventory.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q),
    );
  })();

  const totalInventoryValue = (inventory ?? []).reduce(
    (sum, item) => sum + Number(item.price) * item.stock,
    0,
  );

  async function handleExport() {
    await exportReport.mutateAsync({ type: exportType, range });
    setExportOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-heading">Reports & Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Sales, inventory, and trends for your store.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker
            value={range}
            onChange={setRange}
            activePresetLabel={activePreset}
            onPresetChange={setActivePreset}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setExportOpen(true)}
          >
            <DownloadIcon className="size-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={WalletIcon}
          label="Revenue"
          value={formatPrice(summary?.revenue ?? 0)}
          trend={revenueTrend}
          loading={summaryLoading}
        />
        <StatCard
          icon={ShoppingBagIcon}
          label="Orders"
          value={String(summary?.orderCount ?? 0)}
          trend={ordersTrend}
          loading={summaryLoading}
        />
        <StatCard
          icon={ReceiptTextIcon}
          label="Avg. Order Value"
          value={formatPrice(summary?.avgOrderValue ?? 0)}
          loading={summaryLoading}
        />
        <StatCard
          icon={PackageXIcon}
          label="Low Stock"
          value={String(summary?.lowStockCount ?? 0)}
          loading={summaryLoading}
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Revenue trend
        </h3>
        {salesLoading ? (
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-GH", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  fontSize: 12,
                }}
                formatter={(value) => [formatPrice(Number(value)), "Revenue"]}
                labelFormatter={(value) =>
                  new Date(String(value)).toLocaleDateString("en-GH", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={false}
                fill="url(#revenueFill)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Inventory</h3>
            <p className="text-xs text-muted-foreground">
              Total value: {formatPrice(totalInventoryValue)}
            </p>
          </div>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:w-56"
              aria-label="Search inventory"
            />
          </div>
        </div>

        {inventoryLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : filteredInventory && filteredInventory.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => {
                const status =
                  item.stock === 0
                    ? "out"
                    : item.stock <= 5
                      ? "low"
                      : "ok";

                return (
                  <TableRow
                    key={item.id}
                    className={
                      status !== "ok" ? "bg-destructive/5" : undefined
                    }
                  >
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.categoryName}
                    </TableCell>
                    <TableCell>{item.stock}</TableCell>
                    <TableCell>
                      {status === "out" ? (
                        <Badge variant="destructive">Out of stock</Badge>
                      ) : status === "low" ? (
                        <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                          Low stock
                        </Badge>
                      ) : (
                        <Badge variant="secondary">In stock</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {searchQuery ? "No products match your search." : "No inventory yet."}
          </p>
        )}
      </div>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Export report</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            {(
              [
                { value: "both", label: "Sales & Inventory" },
                { value: "sales", label: "Sales only" },
                { value: "inventory", label: "Inventory only" },
              ] as { value: ExportType; label: string }[]
            ).map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-accent"
              >
                <input
                  type="radio"
                  name="export-type"
                  value={option.value}
                  checked={exportType === option.value}
                  onChange={() => setExportType(option.value)}
                  className="accent-primary"
                />
                {option.label}
              </label>
            ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setExportOpen(false)}
              disabled={exportReport.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleExport}
              disabled={exportReport.isPending}
            >
              {exportReport.isPending ? "Exporting..." : "Download CSV"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
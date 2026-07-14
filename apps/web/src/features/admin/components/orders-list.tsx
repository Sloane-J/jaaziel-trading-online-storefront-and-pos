import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrders } from "@/features/admin/hooks/use-orders";
import type { Order, OrderStatus } from "@/lib/api/orders";
import { formatPrice } from "@/lib/format-price";

const STATUS_FILTERS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "packed", label: "Packed" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const CHANNEL_FILTERS = [
  { value: "all", label: "All" },
  { value: "online", label: "Online" },
  { value: "in_store", label: "In-store" },
];

const STATUS_BADGE_VARIANT: Record<OrderStatus, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  confirmed: "secondary",
  packed: "secondary",
  out_for_delivery: "secondary",
  completed: "default",
  cancelled: "destructive",
};

type SortKey = "totalAmount" | "createdAt";
type SortDirection = "asc" | "desc";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function SortableHeader({
  label,
  sortKey,
  currentSort,
  currentDirection,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey | null;
  currentDirection: SortDirection;
  onSort: (key: SortKey) => void;
}) {
  const isActive = currentSort === sortKey;
  const Icon = isActive
    ? currentDirection === "asc"
      ? ArrowUpIcon
      : ArrowDownIcon
    : ArrowUpDownIcon;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 text-left font-medium transition-colors hover:text-foreground ${
        isActive ? "text-foreground" : "text-muted-foreground"
      }`}
    >
      {label}
      <Icon className="size-3.5" aria-hidden="true" />
    </button>
  );
}

export function OrdersList() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const { data: orders, isLoading, isError, error } = useOrders({
    status: statusFilter === "all" ? undefined : statusFilter,
    channel: channelFilter === "all" ? undefined : channelFilter,
  });

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  }

  const sortedOrders = (() => {
    if (!orders) return orders;
    if (!sortKey) return orders;

    const sorted = [...orders].sort((a: Order, b: Order) => {
      let comparison = 0;
      if (sortKey === "totalAmount") comparison = Number(a.totalAmount) - Number(b.totalAmount);
      if (sortKey === "createdAt") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  })();

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-heading">Orders</h2>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              aria-pressed={statusFilter === filter.value}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                statusFilter === filter.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-foreground hover:bg-accent/70"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {CHANNEL_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setChannelFilter(filter.value)}
              aria-pressed={channelFilter === filter.value}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                channelFilter === filter.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading orders…</p>
      ) : isError ? (
        <p role="alert" className="text-destructive">
          Couldn't load orders: {error instanceof Error ? error.message : "Unknown error"}
        </p>
      ) : sortedOrders && sortedOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">No orders match these filters.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <SortableHeader
                  label="Total"
                  sortKey="totalAmount"
                  currentSort={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  label="Date"
                  sortKey="createdAt"
                  currentSort={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders?.map((order) => (
              <TableRow
                key={order.id}
                onClick={() => navigate(`/admin/orders/${order.id}`)}
                className="cursor-pointer"
              >
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {order.id.slice(0, 8)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {order.channel === "in_store" ? "In-store" : "Online"}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE_VARIANT[order.status]}>
                    {order.status.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {formatPrice(order.totalAmount)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(order.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  SearchIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useApplyPaymentCorrection,
  useFlaggedOrders,
  useSearchOrder,
  useUpdateOrderStatus,
  useVerifyPayment,
} from "@/features/superadmin/hooks/use-superadmin-orders";
import type { OrderRecord, OrderSearchResult } from "@/lib/api/superadmin-orders";
import { formatPrice } from "@/lib/format-price";

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "packed",
  "out_for_delivery",
  "completed",
  "cancelled",
] as const;

const PAYSTACK_STATUS_EXPLANATIONS: Record<string, string> = {
  success: "Payment completed successfully.",
  abandoned: "Customer started checkout but never completed payment.",
  failed: "Payment was attempted but declined (insufficient funds, wrong PIN, etc).",
  pending: "Payment is still being processed by Paystack.",
  reversed: "This payment was successful but has since been reversed.",
};

function explainPaystackStatus(status: string): string {
  return PAYSTACK_STATUS_EXPLANATIONS[status] ?? "Unrecognized status from Paystack.";
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function OrderDetailPanel({ order, items }: OrderSearchResult) {
  const updateStatus = useUpdateOrderStatus();
  const verifyPayment = useVerifyPayment();
  const applyCorrection = useApplyPaymentCorrection();

  const verification = verifyPayment.data;

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Order {order.orderCode}
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{order.id}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{order.channel}</Badge>
          <Badge variant="secondary">{order.fulfillmentType}</Badge>
          <Badge
            variant={order.paymentStatus === "paid" ? "default" : "destructive"}
          >
            {order.paymentStatus}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Contact</p>
          <p className="text-sm text-foreground">{order.contactName ?? "—"}</p>
          <p className="text-sm text-muted-foreground">{order.contactPhone ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Total</p>
          <p className="text-sm font-semibold text-foreground">
            {formatPrice(Number(order.totalAmount))}
          </p>
          <p className="text-xs text-muted-foreground">
            Delivery: {formatPrice(Number(order.deliveryFee))}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Created</p>
          <p className="text-sm text-foreground">{formatTimestamp(order.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Last updated</p>
          <p className="text-sm text-foreground">{formatTimestamp(order.updatedAt)}</p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Items</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Unit price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.productName}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{formatPrice(Number(item.unitPrice))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            Override status
          </p>
          <Select
            value={order.status}
            onValueChange={(value) => {
              if (!value) return;
              updateStatus.mutate({ orderId: order.id, status: value });
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={verifyPayment.isPending}
          onClick={() => verifyPayment.mutate(order.id)}
        >
          <ShieldCheckIcon className="size-4" />
          {verifyPayment.isPending ? "Checking Paystack..." : "Verify payment"}
        </Button>
      </div>

      {verification && (
        <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
          {!verification.found ? (
            <p className="flex items-center gap-2 text-muted-foreground">
              <XCircleIcon className="size-4" />
              No Paystack transaction found for this order — payment was likely
              never initiated.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                {verification.paystackStatus === "success" ? (
                  <CheckCircle2Icon className="size-4 text-success" />
                ) : (
                  <AlertTriangleIcon className="size-4 text-destructive" />
                )}
                Paystack status: <strong>{verification.paystackStatus}</strong>
                {" · "}
                Database status: <strong>{verification.dbPaymentStatus}</strong>
              </p>
            
              {verification.paystackStatus && (
                <p className="pl-6 text-xs text-muted-foreground">
                  {explainPaystackStatus(verification.paystackStatus)}
                </p>
              )}
            
              {verification.amountMatches === false && (
                <p className="text-destructive">
                  Amount mismatch — paid {verification.paidAmount} pesewas,
                  expected {verification.expectedAmount}.
                </p>
              )}
            
              {verification.canApplyCorrection && (
                <Button
                  type="button"
                  size="sm"
                  className="gap-2"
                  disabled={applyCorrection.isPending}
                  onClick={() => applyCorrection.mutate(order.id)}
                >
                  {applyCorrection.isPending
                    ? "Applying..."
                    : "Mark as paid (Paystack-confirmed)"}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SuperadminOrdersContent() {
  const [query, setQuery] = useState("");
  const searchOrder = useSearchOrder();
  const { data: flagged, isLoading: flaggedLoading } = useFlaggedOrders();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    searchOrder.mutate(query.trim());
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading">Orders & Payments</h2>
        <p className="text-sm text-muted-foreground">
          Search any order, override its status, or reconcile a payment
          against Paystack.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Order ID or order code..."
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={searchOrder.isPending}>
          {searchOrder.isPending ? "Searching..." : "Search"}
        </Button>
      </form>

      {searchOrder.isError && (
        <p role="alert" className="text-sm text-destructive">
          {searchOrder.error instanceof Error
            ? searchOrder.error.message
            : "Order not found"}
        </p>
      )}

      {searchOrder.data && <OrderDetailPanel {...searchOrder.data} />}

      <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Flagged for review
          </h3>
          <p className="text-xs text-muted-foreground">
            Orders marked confirmed or completed but still unpaid.
          </p>
        </div>

        {flaggedLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : flagged && flagged.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flagged.map((order: OrderRecord) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => {
                    setQuery(order.orderCode);
                    searchOrder.mutate(order.orderCode);
                  }}
                >
                  <TableCell className="font-medium">{order.orderCode}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{order.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="destructive">{order.paymentStatus}</Badge>
                  </TableCell>
                  <TableCell>{formatPrice(Number(order.totalAmount))}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatTimestamp(order.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No flagged orders — everything looks consistent.
          </p>
        )}
      </div>
    </div>
  );
}
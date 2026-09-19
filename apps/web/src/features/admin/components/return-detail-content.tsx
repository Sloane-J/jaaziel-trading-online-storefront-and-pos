import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  PackageCheckIcon,
  XCircleIcon,
} from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useReturnDetail,
  useRestoreReturnInventory,
  useUpdateReturnStatus,
} from "@/features/admin/hooks/use-admin-returns";
import { formatPrice } from "@/lib/format-price";

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-GH", { dateStyle: "medium", timeStyle: "short" });
}

const STATUS_STEPS = ["requested", "item_received", "approved", "refunded"] as const;

export function ReturnDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error } = useReturnDetail(id ?? "");
  const updateStatus = useUpdateReturnStatus(id ?? "");
  const restoreInventory = useRestoreReturnInventory(id ?? "");

  const [refundAmount, setRefundAmount] = useState("");
  const [includeDeliveryFee, setIncludeDeliveryFee] = useState(false);

  if (isLoading) {
    return <p className="text-muted-foreground">Loading return…</p>;
  }

  if (isError || !data) {
    return (
      <p role="alert" className="text-destructive">
        Couldn't load return:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </p>
    );
  }

  const { return: returnRecord, order, items } = data;
  const isFinalized = returnRecord.status === "refunded" || returnRecord.status === "rejected";
  const currentStepIndex = STATUS_STEPS.indexOf(
    returnRecord.status as (typeof STATUS_STEPS)[number],
  );

  async function handleMarkReceived() {
    await updateStatus.mutateAsync({ status: "item_received" });
  }

  async function handleApprove() {
    const amount = Number(refundAmount);
    if (!refundAmount || Number.isNaN(amount) || amount < 0) return;
    await updateStatus.mutateAsync({
      status: "approved",
      refundAmount: amount,
      includeDeliveryFee,
    });
  }

  async function handleReject() {
    await updateStatus.mutateAsync({ status: "rejected" });
  }

  async function handleMarkRefunded() {
    await updateStatus.mutateAsync({ status: "refunded" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-heading">Return request</h2>
          <p className="text-sm text-muted-foreground">
            Order {order.orderCode} · Requested {formatTimestamp(returnRecord.createdAt)}
          </p>
        </div>
        <Badge
          variant={
            returnRecord.status === "refunded"
              ? "default"
              : returnRecord.status === "rejected"
                ? "destructive"
                : "secondary"
          }
        >
          {returnRecord.status.replace("_", " ")}
        </Badge>
      </div>

      {/* Progress indicator */}
      {!isFinalized && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-4">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex flex-1 items-center gap-2">
              <div
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  i <= currentStepIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-xs capitalize ${
                  i <= currentStepIndex ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.replace("_", " ")}
              </span>
              {i < STATUS_STEPS.length - 1 && (
                <div className="h-px flex-1 bg-border" />
              )}
            </div>
          ))}
        </div>
      )}

      {returnRecord.status === "rejected" && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          <XCircleIcon className="size-4 shrink-0" />
          This return was rejected.
        </div>
      )}

      {/* Order + contact info */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Customer</p>
          <p className="text-sm text-foreground">{order.contactName ?? "—"}</p>
          <p className="text-sm text-muted-foreground">{order.contactPhone ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Order total</p>
          <p className="text-sm text-foreground">{formatPrice(Number(order.totalAmount))}</p>
          <p className="text-xs text-muted-foreground">
            Delivery fee: {formatPrice(Number(order.deliveryFee))}
          </p>
        </div>
        {returnRecord.paystackReference && (
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Paystack reference / receipt
            </p>
            <p className="font-mono text-sm text-foreground">
              {returnRecord.paystackReference}
            </p>
          </div>
        )}
        {returnRecord.notes && (
          <div>
            <p className="text-xs font-medium text-muted-foreground">Customer notes</p>
            <p className="text-sm text-foreground">{returnRecord.notes}</p>
          </div>
        )}
      </div>

      {/* Items being returned */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">Items to return</p>
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-start justify-between gap-3 rounded-lg border border-border p-3 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">{item.productName}</p>
                {item.reason && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Reason: {item.reason}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-muted-foreground">Qty {item.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {!isFinalized && (
        <div className="space-y-4 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-semibold text-foreground">Actions</p>

          {returnRecord.status === "requested" && (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="gap-1.5"
                onClick={handleMarkReceived}
                disabled={updateStatus.isPending}
              >
                <PackageCheckIcon className="size-3.5" />
                Mark item received
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:bg-destructive/10"
                onClick={handleReject}
                disabled={updateStatus.isPending}
              >
                Reject request
              </Button>
            </div>
          )}

          {returnRecord.status === "item_received" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="refund-amount">Refund amount (GHS)</Label>
                  <Input
                    id="refund-amount"
                    type="number"
                    min={0}
                    step="0.01"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-end pb-1.5">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={includeDeliveryFee}
                      onChange={(e) => setIncludeDeliveryFee(e.target.checked)}
                      className="size-4 accent-primary"
                    />
                    Include delivery fee in refund
                  </label>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={handleApprove}
                  disabled={updateStatus.isPending || !refundAmount}
                >
                  <CheckCircle2Icon className="size-3.5" />
                  Approve with this amount
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={handleReject}
                  disabled={updateStatus.isPending}
                >
                  Reject request
                </Button>
              </div>
            </div>
          )}

          {returnRecord.status === "approved" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg bg-muted/60 p-3 text-sm">
                <AlertTriangleIcon className="size-4 shrink-0 text-muted-foreground" />
                Approved for {formatPrice(Number(returnRecord.refundAmount ?? 0))}
                {returnRecord.includeDeliveryFee ? " (includes delivery fee)" : ""}.
                Send the refund manually via MoMo, bank transfer, or cash, then
                confirm below.
              </div>
              <Button
                size="sm"
                className="gap-1.5"
                onClick={handleMarkRefunded}
                disabled={updateStatus.isPending}
              >
                <CheckCircle2Icon className="size-3.5" />
                I've sent the refund — mark as refunded
              </Button>
            </div>
          )}
        </div>
      )}

      {returnRecord.status === "refunded" && (
        <div className="space-y-3 rounded-xl border border-success/40 bg-success/5 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-success">
            <CheckCircle2Icon className="size-4" />
            Refunded {formatPrice(Number(returnRecord.refundAmount ?? 0))} on{" "}
            {returnRecord.processedAt ? formatTimestamp(returnRecord.processedAt) : "—"}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => restoreInventory.mutate()}
            disabled={restoreInventory.isPending}
          >
            {restoreInventory.isPending ? "Restoring..." : "Restore items to inventory"}
          </Button>
        </div>
      )}
    </div>
  );
}
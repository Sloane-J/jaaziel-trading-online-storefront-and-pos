import {
  AlertCircleIcon,
  ArrowLeftIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  HashIcon,
  Loader2Icon,
  MessageSquareIcon,
  PackageSearchIcon,
  PhoneIcon,
  ReceiptIcon,
  RotateCcwIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateReturn,
  useLookupOrderForReturn,
} from "@/features/storefront/hooks/use-returns";
import type { OrderLookupResult } from "@/lib/api/returns";
import { formatPrice } from "@/lib/format-price";
import { cn } from "@/lib/utils";

type SelectedItem = {
  productId: string;
  quantity: number;
  reason: string;
};

/* Scoped micro-animation keyframes (can be moved to index.css) */
const RETURN_ANIMATIONS = `
@keyframes returns-shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-3px); }
  40%, 60% { transform: translateX(3px); }
}
@keyframes returns-pop {
  0% { transform: scale(0.4); opacity: 0; }
  70% { transform: scale(1.08); }
  100% { transform: scale(1); opacity: 1; }
}
`;

/* ------------------------------------------------------------------ */
/* Step 1 — Find your order                                            */
/* ------------------------------------------------------------------ */
function LookupStep({
  onFound,
}: {
  onFound: (result: OrderLookupResult, orderCode: string, phone: string) => void;
}) {
  const [orderCode, setOrderCode] = useState("");
  const [phone, setPhone] = useState("");
  const lookup = useLookupOrderForReturn();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const result = await lookup.mutateAsync({ orderCode: orderCode.trim(), phone: phone.trim() });
      onFound(result, orderCode.trim(), phone.trim());
    } catch {
      // error surfaced via lookup.isError below
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-in fade-in slide-in-from-bottom-3 space-y-5 duration-500"
    >
      <div className="space-y-2">
        <Label htmlFor="order-code" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Order code
        </Label>
        <div className="group relative">
          <HashIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            id="order-code"
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
            placeholder="e.g. D7UGWG"
            maxLength={6}
            autoComplete="off"
            className="h-11 rounded-xl pl-9 uppercase tracking-[0.2em] transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          You'll find this 6-character code in your order confirmation message.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Checkout phone number
        </Label>
        <div className="group relative">
          <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 0268031319"
            className="h-11 rounded-xl pl-9 transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
      </div>

      {lookup.isError && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive animate-[returns-shake_0.4s_ease]"
        >
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
          {lookup.error instanceof Error
            ? lookup.error.message
            : "We couldn't find an order matching those details. Double-check the code and phone number."}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={lookup.isPending}
        className="h-11 w-full rounded-full shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]"
      >
        {lookup.isPending ? (
          <>
            <Loader2Icon className="mr-2 size-4 animate-spin" />
            Finding your order...
          </>
        ) : (
          <>
            <PackageSearchIcon className="mr-2 size-4" />
            Find my order
          </>
        )}
      </Button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2 — Choose items & submit                                      */
/* ------------------------------------------------------------------ */
function RequestStep({
  result,
  orderCode,
  phone,
  onSubmitted,
}: {
  result: OrderLookupResult;
  orderCode: string;
  phone: string;
  onSubmitted: () => void;
}) {
  const [selected, setSelected] = useState<Record<string, SelectedItem>>({});
  const [paystackReference, setPaystackReference] = useState("");
  const [notes, setNotes] = useState("");
  const createReturn = useCreateReturn();

  function toggleItem(productId: string, maxQuantity: number) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[productId]) {
        delete next[productId];
      } else {
        next[productId] = { productId, quantity: 1, reason: "" };
      }
      return next;
    });
  }

  function updateQuantity(productId: string, quantity: number, max: number) {
    setSelected((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], quantity: Math.min(Math.max(1, quantity), max) },
    }));
  }

  function updateReason(productId: string, reason: string) {
    setSelected((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], reason },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const items = Object.values(selected).map((s) => ({
      productId: s.productId,
      quantity: s.quantity,
      reason: s.reason.trim() || undefined,
    }));

    if (items.length === 0) return;

    try {
      await createReturn.mutateAsync({
        orderId: result.order.id,
        orderCode,
        phone,
        items,
        paystackReference: paystackReference.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onSubmitted();
    } catch {
      // error surfaced via createReturn.isError below
    }
  }

  const hasSelection = Object.keys(selected).length > 0;
  const selectedCount = Object.keys(selected).length;

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-in fade-in slide-in-from-bottom-3 space-y-6 duration-500"
    >
      {/* Order summary */}
      <div className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Order</p>
            <p className="mt-0.5 truncate font-semibold tracking-wide text-foreground">
              {result.order.orderCode}
            </p>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Placed{" "}
              {new Date(result.order.createdAt).toLocaleDateString("en-GH", { dateStyle: "medium" })}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total paid</p>
            <p className="mt-0.5 text-lg font-semibold text-primary">
              {formatPrice(Number(result.order.totalAmount))}
            </p>
          </div>
        </div>
      </div>

      {/* Item selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Which items are you returning?</p>
          {hasSelection && (
            <span className="animate-in zoom-in rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
              {selectedCount} selected
            </span>
          )}
        </div>

        <div className="grid gap-3">
          {result.items.map((item) => {
            const isSelected = Boolean(selected[item.productId]);
            return (
              <div
                key={item.id}
                className={cn(
                  "group rounded-xl border bg-card p-3 transition-all duration-300 sm:p-4",
                  "hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5",
                  isSelected
                    ? "border-primary bg-primary-light/10 shadow-md shadow-primary/10 ring-1 ring-primary/20"
                    : "border-border hover:border-primary/40",
                )}
              >
                <label className="flex cursor-pointer items-center gap-3">
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/40 group-hover:border-primary/60",
                    )}
                  >
                    {isSelected && (
                      <CheckCircle2Icon className="size-3.5 animate-in zoom-in text-primary-foreground" />
                    )}
                  </span>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleItem(item.productId, item.quantity)}
                    className="sr-only"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {item.productName}
                  </span>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    Qty {item.quantity}
                  </span>
                </label>

                {/* Animated expand */}
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isSelected ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-3 border-t border-primary/15 pt-3 sm:pl-8">
                      <div className="flex flex-wrap items-center gap-2">
                        <Label
                          htmlFor={`qty-${item.productId}`}
                          className="text-xs text-muted-foreground"
                        >
                          Quantity to return
                        </Label>
                        <div className="flex items-center rounded-lg border border-border">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            className="flex size-8 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                            disabled={!isSelected || selected[item.productId]?.quantity <= 1}
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                selected[item.productId].quantity - 1,
                                item.quantity,
                              )
                            }
                          >
                            −
                          </button>
                          <Input
                            id={`qty-${item.productId}`}
                            type="number"
                            min={1}
                            max={item.quantity}
                            value={selected[item.productId]?.quantity ?? 1}
                            onChange={(e) =>
                              updateQuantity(item.productId, Number(e.target.value), item.quantity)
                            }
                            className="h-8 w-14 rounded-none border-0 border-x text-center focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            className="flex size-8 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                            disabled={!isSelected || selected[item.productId]?.quantity >= item.quantity}
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                selected[item.productId].quantity + 1,
                                item.quantity,
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <Textarea
                        value={selected[item.productId]?.reason ?? ""}
                        onChange={(e) => updateReason(item.productId, e.target.value)}
                        placeholder="Why are you returning this? (optional, but it helps us)"
                        rows={2}
                        className="resize-none rounded-xl bg-background/60 text-sm transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optional details */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="paystack-ref" className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <ReceiptIcon className="size-3.5" />
            Payment reference
            <span className="normal-case tracking-normal text-muted-foreground/70">(optional)</span>
          </Label>
          <Input
            id="paystack-ref"
            value={paystackReference}
            onChange={(e) => setPaystackReference(e.target.value)}
            placeholder="From your Paystack receipt email"
            className="h-11 rounded-xl transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes" className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <MessageSquareIcon className="size-3.5" />
            Anything else we should know?
            <span className="normal-case tracking-normal text-muted-foreground/70">(optional)</span>
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add any details that will help us process your return faster"
            className="resize-none rounded-xl transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
      </div>

      {createReturn.isError && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive animate-[returns-shake_0.4s_ease]"
        >
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
          {createReturn.error instanceof Error
            ? createReturn.error.message
            : "Your request couldn't be submitted. Please try again."}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={!hasSelection || createReturn.isPending}
        className="h-11 w-full rounded-full shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]"
      >
        {createReturn.isPending ? (
          <>
            <Loader2Icon className="mr-2 size-4 animate-spin" />
            Submitting your request...
          </>
        ) : (
          <>
            <ClipboardListIcon className="mr-2 size-4" />
            Submit return request
            {hasSelection && (
              <span className="ml-2 rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs">
                {selectedCount} item{selectedCount > 1 ? "s" : ""}
              </span>
            )}
          </>
        )}
      </Button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Success screen                                                      */
/* ------------------------------------------------------------------ */
function SuccessScreen({ onReset }: { onReset: () => void }) {
  return (
    <div className="animate-in fade-in zoom-in-95 flex flex-col items-center gap-4 py-10 text-center duration-500 sm:py-14">
      <span className="flex size-20 items-center justify-center rounded-full bg-success/10 animate-[returns-pop_0.5s_ease-out]">
        <CheckCircle2Icon className="size-11 text-success" />
      </span>

      <div className="space-y-1.5">
        <p className="text-xl font-semibold text-foreground">Request received</p>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          Thanks — we've got your return request and will review it shortly. We'll text updates to
          the phone number you provided.
        </p>
      </div>

      <Button variant="outline" onClick={onReset} className="mt-2 rounded-full">
        <ArrowLeftIcon className="mr-2 size-4" />
        Start another return
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */
export function ReturnRequestForm() {
  const [result, setResult] = useState<OrderLookupResult | null>(null);
  const [orderCode, setOrderCode] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6 sm:py-10">
      <style>{RETURN_ANIMATIONS}</style>

      {/* Steps */}
      {submitted ? (
        <SuccessScreen
          onReset={() => {
            setResult(null);
            setOrderCode("");
            setPhone("");
            setSubmitted(false);
          }}
        />
      ) : !result ? (
        <div className="animate-in fade-in space-y-5">
          <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary-light/10 p-4">
            <PackageSearchIcon className="mt-0.5 size-5 shrink-0 text-primary" />
            <p className="text-sm text-foreground">
              To pull up your order, enter the 6-character order code together with the phone
              number you used at checkout.
            </p>
          </div>
          <LookupStep
            onFound={(res, code, ph) => {
              setResult(res);
              setOrderCode(code);
              setPhone(ph);
            }}
          />
        </div>
      ) : (
        <div className="space-y-5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setResult(null)}
            className="-ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="mr-1.5 size-4" />
            Not the right order?
          </Button>
          <RequestStep
            result={result}
            orderCode={orderCode}
            phone={phone}
            onSubmitted={() => setSubmitted(true)}
          />
        </div>
      )}
    </div>
  );
}
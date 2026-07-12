import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeftIcon,
  BanknoteIcon,
  CreditCardIcon,
  SmartphoneIcon,
  PrinterIcon,
  CheckCircle2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateSale } from "@/features/pos/hooks/use-pos";
import { usePosSale } from "@/features/pos/context/pos-sale-context";
import { formatPrice } from "@/lib/format-price";

type PaymentMethod = "cash" | "mobile_money" | "card";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: typeof BanknoteIcon }[] = [
  { value: "cash", label: "Cash", icon: BanknoteIcon },
  { value: "mobile_money", label: "Mobile Money", icon: SmartphoneIcon },
  { value: "card", label: "Card", icon: CreditCardIcon },
];

export function PosPaymentPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { items, orderNumber, subtotal, clearSale } = usePosSale();
  const createSale = useCreateSale();

  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [amountTendered, setAmountTendered] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<{
    total: number;
    method: PaymentMethod;
    tendered: number;
    change: number;
  } | null>(null);

  if (items.length === 0 && !completedOrder) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background text-center">
        <p className="text-muted-foreground">No order in progress.</p>
        <Button onClick={() => navigate("/pos")}>Back to POS</Button>
      </div>
    );
  }

  const total = subtotal;
  const tendered = Number(amountTendered) || 0;
  const change = method === "cash" ? Math.max(0, tendered - total) : 0;
  const cashInsufficient = method === "cash" && amountTendered !== "" && tendered < total;

  async function handleConfirm() {
    setError(null);

    if (method === "cash" && (amountTendered === "" || tendered < total)) {
      setError("Enter an amount tendered that covers the total.");
      return;
    }

    try {
      await createSale.mutateAsync({
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
        paymentMethod: method,
      });

      setCompletedOrder({ total, method, tendered, change });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete the sale. Please try again.");
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleNewSale() {
    clearSale();
    navigate("/pos");
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-6 py-4 print:hidden">
        <button
          type="button"
          onClick={() => navigate("/pos")}
          aria-label="Back to POS"
          className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Back
        </button>
        <h1 className="font-heading text-lg font-semibold text-foreground">
          Payment — {orderNumber}
        </h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Invoice, pinned to the left */}
        <aside className="flex w-72 shrink-0 flex-col border-r border-border bg-card print:hidden">
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Order
            </p>
            <p className="font-heading text-base font-semibold text-foreground">{orderNumber}</p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between gap-2 text-sm">
                <span className="min-w-0 flex-1 truncate text-foreground">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="shrink-0 text-foreground">
                  {formatPrice(Number(item.product.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-border px-4 py-3 text-sm font-semibold text-foreground">
            <div className="flex justify-between">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </aside>

        {/* Payment area — spacious, large total */}
        <main className="flex flex-1 items-center justify-center overflow-y-auto p-8">
          {completedOrder ? (
            <div className="w-full max-w-sm space-y-6">
              <div
                id="receipt"
                className="space-y-4 rounded-2xl border border-border bg-card p-6 print:border-none print:shadow-none"
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <CheckCircle2Icon className="size-10 text-primary print:hidden" />
                  <p className="font-heading text-lg font-semibold text-foreground">
                    Jaaziel Trading Enterprise
                  </p>
                  <p className="text-xs text-muted-foreground">Order {orderNumber}</p>
                </div>

                <div className="space-y-2 border-t border-border pt-4 text-sm">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between">
                      <span className="text-foreground">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="text-foreground">
                        {formatPrice(Number(item.product.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between font-semibold text-foreground">
                    <span>Total</span>
                    <span>{formatPrice(completedOrder.total)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Paid via</span>
                    <span className="capitalize">{completedOrder.method.replace("_", " ")}</span>
                  </div>
                  {completedOrder.method === "cash" && (
                    <>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Tendered</span>
                        <span>{formatPrice(completedOrder.tendered)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Change</span>
                        <span>{formatPrice(completedOrder.change)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3 print:hidden">
                <Button variant="outline" className="flex-1 gap-2" onClick={handlePrint}>
                  <PrinterIcon className="size-4" />
                  Print receipt
                </Button>
                <Button className="flex-1" onClick={handleNewSale}>
                  New sale
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md space-y-8 text-center">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Amount due
                </p>
                <p className="mt-2 font-heading text-6xl font-bold text-foreground">
                  {formatPrice(total)}
                </p>
              </div>

              <div className="space-y-2 text-left">
                <Label>Payment method</Label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_OPTIONS.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMethod(value)}
                      aria-pressed={method === value}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-4 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        method === value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      <Icon className="size-6" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {method === "cash" && (
                <div className="space-y-2 text-left">
                  <Label htmlFor="amount-tendered">Amount tendered</Label>
                  <Input
                    id="amount-tendered"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(e.target.value)}
                    placeholder="0.00"
                    className="text-center text-lg"
                  />
                  {amountTendered !== "" && !cashInsufficient && (
                    <p className="text-center text-sm text-muted-foreground">
                      Change due:{" "}
                      <span className="font-medium text-foreground">{formatPrice(change)}</span>
                    </p>
                  )}
                  {cashInsufficient && (
                    <p className="text-center text-sm text-destructive">
                      Amount is less than the total.
                    </p>
                  )}
                </div>
              )}

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button
                size="lg"
                className="w-full"
                disabled={createSale.isPending}
                onClick={handleConfirm}
              >
                {createSale.isPending ? "Processing..." : "Confirm payment"}
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
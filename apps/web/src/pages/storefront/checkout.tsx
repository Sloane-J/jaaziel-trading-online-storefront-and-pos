import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { StorefrontLayout } from "@/components/shared/storefront-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/features/storefront/hooks/use-cart";
import { useCreateCheckout } from "@/features/storefront/hooks/use-checkout";
import { formatPrice } from "@/lib/format-price";

const API_URL = import.meta.env.VITE_API_URL;

type FulfillmentType = "delivery" | "pickup_in_store";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cartData, isLoading: cartLoading } = useCart();
  const createCheckout = useCreateCheckout();

  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>("pickup_in_store");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Delivery fee estimate shown to the customer. Real fee is recalculated
  // server-side when the order is actually created — this is just a preview.
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryFeeLoading, setDeliveryFeeLoading] = useState(false);
  const [deliveryFeeError, setDeliveryFeeError] = useState<string | null>(null);

  const items = cartData?.items ?? [];
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );
  const total = subtotal + (fulfillmentType === "delivery" ? deliveryFee : 0);

  // When the customer types an area and pauses for a moment, ask the backend
  // for a delivery fee estimate. Waits 800ms after typing stops so we don't
  // call the API on every single keystroke.
  useEffect(() => {
    if (fulfillmentType !== "delivery" || !area.trim()) {
      setDeliveryFee(0);
      setDeliveryFeeError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setDeliveryFeeLoading(true);
      setDeliveryFeeError(null);
      try {
        const res = await fetch(`${API_URL}/checkout/delivery-fee`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ area }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? "Could not calculate delivery fee.");
        }
        const data = await res.json();
        setDeliveryFee(data.fee);
      } catch (err) {
        setDeliveryFeeError(
          err instanceof Error ? err.message : "Could not calculate delivery fee.",
        );
        setDeliveryFee(0);
      } finally {
        setDeliveryFeeLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [area, fulfillmentType]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!contactName.trim() || !contactPhone.trim()) {
      setError("Name and phone number are required.");
      return;
    }

    if (fulfillmentType === "delivery" && (!street.trim() || !area.trim())) {
      setError("Delivery address is required.");
      return;
    }

    try {
      const result = await createCheckout.mutateAsync({
        fulfillmentType,
        contactName,
        contactPhone,
        contactEmail: contactEmail || undefined,
        deliveryAddress:
          fulfillmentType === "delivery"
            ? { street, area, landmark: landmark || undefined }
            : undefined,
      });

      navigate(`/order-confirmation/${result.order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place your order. Please try again.");
    }
  }

  if (cartLoading) {
    return (
      <StorefrontLayout>
        <div className="mx-auto max-w-[1600px] px-6 py-12">
          <p className="text-muted-foreground">Loading your cart…</p>
        </div>
      </StorefrontLayout>
    );
  }

  if (items.length === 0) {
    return (
      <StorefrontLayout>
        <div className="mx-auto max-w-[1600px] px-6 py-24 text-center">
          <p className="text-lg font-medium text-foreground">Your cart is empty</p>
          <Button className="mt-6" onClick={() => navigate("/")}>
            Continue shopping
          </Button>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-[1600px] px-6 py-12">
        <h1 className="mb-8 font-heading text-3xl font-semibold text-foreground">Checkout</h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
              <h2 className="text-base font-semibold text-foreground">How would you like to get your order?</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFulfillmentType("pickup_in_store")}
                  aria-pressed={fulfillmentType === "pickup_in_store"}
                  className={`rounded-xl border p-4 text-left text-sm font-medium transition-colors ${
                    fulfillmentType === "pickup_in_store"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  Pickup in-store
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillmentType("delivery")}
                  aria-pressed={fulfillmentType === "delivery"}
                  className={`rounded-xl border p-4 text-left text-sm font-medium transition-colors ${
                    fulfillmentType === "delivery"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  Delivery
                </button>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
              <h2 className="text-base font-semibold text-foreground">Contact details</h2>
              <div className="space-y-2">
                <Label htmlFor="contact-name">Full name</Label>
                <Input
                  id="contact-name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Phone number</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. 024 000 0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email (optional)</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {fulfillmentType === "delivery" && (
              <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
                <h2 className="text-base font-semibold text-foreground">Delivery address</h2>
                <div className="space-y-2">
                  <Label htmlFor="street">Street address</Label>
                  <Input
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="House number and street"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Area / town</Label>
                  <Input
                    id="area"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Madina"
                  />
                  {deliveryFeeLoading && (
                    <p className="text-sm text-muted-foreground">Calculating delivery fee…</p>
                  )}
                  {deliveryFeeError && (
                    <p className="text-sm text-destructive">{deliveryFeeError}</p>
                  )}
                  {!deliveryFeeLoading && !deliveryFeeError && deliveryFee > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Delivery fee: <span className="font-medium text-foreground">{formatPrice(deliveryFee)}</span>
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landmark">Landmark (optional)</Label>
                  <Input
                    id="landmark"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Nearby landmark to help find you"
                  />
                </div>
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={createCheckout.isPending}
            >
              {createCheckout.isPending ? "Placing order..." : "Place order"}
            </Button>
          </form>

          <div className="h-fit space-y-3 rounded-2xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold text-foreground">Order summary</h2>
            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-foreground">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="text-foreground">
                    {formatPrice(Number(item.product.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-1 border-t border-border pt-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery fee</span>
                <span>{fulfillmentType === "delivery" ? formatPrice(deliveryFee) : "—"}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-foreground">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
import { ChevronRight, Lock, ShieldCheck, Store, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { StorefrontLayout } from "@/components/shared/storefront-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/features/storefront/hooks/use-cart";
import { useCreateCheckout } from "@/features/storefront/hooks/use-checkout";
import { initiatePayment } from "@/lib/api/checkout";
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

	const [deliveryFee, setDeliveryFee] = useState(0);
	const [deliveryFeeLoading, setDeliveryFeeLoading] = useState(false);
	const [deliveryFeeError, setDeliveryFeeError] = useState<string | null>(null);

	const [isRedirecting, setIsRedirecting] = useState(false);

	const items = cartData?.items ?? [];
	const subtotal = items.reduce(
		(sum, item) => sum + Number(item.product.price) * item.quantity,
		0,
	);
	const total = subtotal + (fulfillmentType === "delivery" ? deliveryFee : 0);

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
					throw new Error(body?.error ?? "We couldn't find this location. Please check the spelling or try entering a broader area or nearby town.");
				}
				const data = await res.json();
				setDeliveryFee(data.fee);
			} catch (err) {
				setDeliveryFeeError(
					err instanceof Error ? err.message : "Unable to calculate the delivery fee right now. Please verify the address or try again.",
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
			setIsRedirecting(true);
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

			const payment = await initiatePayment(result.order.id);
			window.location.href = payment.authorizationUrl;
		} catch (err) {
			setIsRedirecting(false);
			setError(err instanceof Error ? err.message : "Could not place your order. Please try again.");
		}
	}

	if (cartLoading) {
		return (
			<StorefrontLayout>
				<div className="mx-auto max-w-[800px] px-6 py-24 text-center">
					<div className="mx-auto mb-4 size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					<p className="text-muted-foreground">Loading your secure checkout…</p>
				</div>
			</StorefrontLayout>
		);
	}

	if (isRedirecting) {
		return (
			<StorefrontLayout>
				<div className="mx-auto max-w-[800px] px-6 py-24 text-center">
					<div className="mx-auto mb-4 size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					<p className="text-muted-foreground">Redirecting you to payment…</p>
				</div>
			</StorefrontLayout>
		);
	}

	if (items.length === 0) {
		return (
			<StorefrontLayout>
				<div className="mx-auto max-w-[800px] px-6 py-24 text-center">
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
			<div className="mx-auto max-w-[1160px] px-4 py-10 sm:px-6 lg:py-16">
				{/* Top Branding / Security indicator */}
				<div className="mb-8 flex items-center justify-between border-b border-border/60 pb-5">
					<div>
						<h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
							Secure Checkout
						</h1>
						<p className="text-xs text-muted-foreground sm:text-sm">
							Complete your order safely
						</p>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
					{/* Left column: form steps */}
					<div className="space-y-8">
						{/* 1. Fulfillment Method (Stacked) */}
						<div className="space-y-3">
							<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
								1. Choose Fulfillment Method
							</h2>
							<div className="flex flex-col gap-3">
								<button
									type="button"
									onClick={() => setFulfillmentType("pickup_in_store")}
									aria-pressed={fulfillmentType === "pickup_in_store"}
									className={`group relative flex items-center justify-between rounded-2xl border p-5 text-left transition-all ${
										fulfillmentType === "pickup_in_store"
											? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
											: "border-border/80 bg-card hover:bg-muted/50"
									}`}
								>
									<div className="flex items-center gap-4">
										<div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
											fulfillmentType === "pickup_in_store" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
										}`}>
											<Store className="h-6 w-6" />
										</div>
										<div>
											<p className="font-semibold text-foreground">Pickup In-Store</p>
											<p className="text-xs text-muted-foreground sm:text-sm">Collect directly from our physical store location</p>
										</div>
									</div>
									<div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
										fulfillmentType === "pickup_in_store" ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
									}`}>
										{fulfillmentType === "pickup_in_store" && <div className="h-2 w-2 rounded-full bg-white" />}
									</div>
								</button>

								<button
									type="button"
									onClick={() => setFulfillmentType("delivery")}
									aria-pressed={fulfillmentType === "delivery"}
									className={`group relative flex items-center justify-between rounded-2xl border p-5 text-left transition-all ${
										fulfillmentType === "delivery"
											? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
											: "border-border/80 bg-card hover:bg-muted/50"
									}`}
								>
									<div className="flex items-center gap-4">
										<div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
											fulfillmentType === "delivery" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
										}`}>
											<Truck className="h-6 w-6" />
										</div>
										<div>
											<p className="font-semibold text-foreground">Home / Office Delivery</p>
											<p className="text-xs text-muted-foreground sm:text-sm">Delivered right to your doorstep via courier</p>
										</div>
									</div>
									<div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
										fulfillmentType === "delivery" ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
									}`}>
										{fulfillmentType === "delivery" && <div className="h-2 w-2 rounded-full bg-white" />}
									</div>
								</button>
							</div>
						</div>

						{/* 2. Contact Information */}
						<div className="space-y-4 rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
							<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
								2. Contact Details
							</h2>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div className="space-y-2 sm:col-span-2">
									<Label htmlFor="contact-name">Full Name *</Label>
									<Input
										id="contact-name"
										value={contactName}
										onChange={(e) => setContactName(e.target.value)}
										placeholder="e.g. John Doe"
										className="h-11 bg-muted/20"
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="contact-phone">Phone Number *</Label>
									<Input
										id="contact-phone"
										type="tel"
										value={contactPhone}
										onChange={(e) => setContactPhone(e.target.value)}
										placeholder="e.g. 024 000 0000"
										className="h-11 bg-muted/20"
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="contact-email">Email Address (Optional)</Label>
									<Input
										id="contact-email"
										type="email"
										value={contactEmail}
										onChange={(e) => setContactEmail(e.target.value)}
										placeholder="you@example.com"
										className="h-11 bg-muted/20"
									/>
								</div>
							</div>
						</div>

						{/* 3. Delivery Address (Conditional) */}
						{fulfillmentType === "delivery" && (
							<div className="space-y-4 rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:p-8 animate-in fade-in slide-in-from-top-2 duration-300">
								<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
									3. Delivery Information
								</h2>
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="street">Street Address *</Label>
										<Input
											id="street"
											value={street}
											onChange={(e) => setStreet(e.target.value)}
											placeholder="House number, street name or building"
											className="h-11 bg-muted/20"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="area">Area / Town *</Label>
										<Input
											id="area"
											value={area}
											onChange={(e) => setArea(e.target.value)}
											placeholder="e.g. Madina, East Legon"
											className="h-11 bg-muted/20"
										/>
										{deliveryFeeLoading && (
											<p className="text-xs text-muted-foreground">Calculating delivery estimate…</p>
										)}
										{deliveryFeeError && (
											<p className="text-xs text-destructive">{deliveryFeeError}</p>
										)}
										{!deliveryFeeLoading && !deliveryFeeError && deliveryFee > 0 && (
											<p className="text-xs text-muted-foreground">
												Estimated delivery fee: <span className="font-semibold text-foreground">{formatPrice(deliveryFee)}</span>
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="landmark">Nearby Landmark (Optional)</Label>
										<Input
											id="landmark"
											value={landmark}
											onChange={(e) => setLandmark(e.target.value)}
											placeholder="e.g. Near the junction, blue gate"
											className="h-11 bg-muted/20"
										/>
									</div>
								</div>
							</div>
						)}

						{error && (
							<div role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
								{error}
							</div>
						)}
					</div>

					{/* Right column: order summary + payment CTA, sticky on desktop */}
					<div className="space-y-4 lg:sticky lg:top-24">
						<div className="space-y-4 rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
							<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
								Order Summary ({items.reduce((acc, item) => acc + item.quantity, 0)} items)
							</h2>

							<div className="max-h-72 divide-y divide-border/60 overflow-y-auto pr-1">
								{items.map((item) => (
									<div key={item.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
										<div className="flex items-center gap-3 pr-4">
										{item.product.images?.[0] && (
  <img
    src={item.product.images[0]}
    alt={item.product.name}
    className="h-12 w-12 shrink-0 rounded-xl border border-border/50 object-cover"
  />
										)}
											<div>
												<p className="line-clamp-1 text-sm font-medium text-foreground">{item.product.name}</p>
												<p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
											</div>
										</div>
										<span className="shrink-0 text-sm font-semibold text-foreground">
											{formatPrice(Number(item.product.price) * item.quantity)}
										</span>
									</div>
								))}
							</div>

							<div className="space-y-2 border-t border-border pt-4 text-sm">
								<div className="flex justify-between text-muted-foreground">
									<span>Subtotal</span>
									<span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
								</div>
								<div className="flex justify-between text-muted-foreground">
									<span>Fulfillment Cost</span>
									<span className="font-medium text-foreground">
										{fulfillmentType === "delivery" ? (deliveryFee > 0 ? formatPrice(deliveryFee) : "Calculated at area") : "Free (In-Store)"}
									</span>
								</div>
								<div className="flex justify-between border-t border-border/80 pt-3 text-lg font-bold text-foreground">
									<span>Total Amount</span>
									<span className="text-primary">{formatPrice(total)}</span>
								</div>
							</div>

							<Button
								type="submit"
								size="lg"
								className="h-14 w-full rounded-2xl text-base font-semibold shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
								disabled={createCheckout.isPending || isRedirecting}
							>
								{isRedirecting ? (
									<span className="flex items-center gap-2">
										<span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-r-transparent" />
										Redirecting to Secure Payment...
									</span>
								) : createCheckout.isPending ? (
									<span className="flex items-center gap-2">
										<span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-r-transparent" />
										Processing Order...
									</span>
								) : (
									<span className="flex items-center justify-center gap-2">
										Proceed to Secure Payment ({formatPrice(total)})
										<ChevronRight className="h-5 w-5" />
									</span>
								)}
							</Button>

							<div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
								<ShieldCheck className="h-4 w-4 text-emerald-500" />
								<span>Guaranteed safe checkout & secure payment processing</span>
							</div>
						</div>

						<div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
							<Lock className="h-3.5 w-3.5" />
							<span>Your information is encrypted and never shared</span>
						</div>
					</div>
				</form>
			</div>
		</StorefrontLayout>
	);
}

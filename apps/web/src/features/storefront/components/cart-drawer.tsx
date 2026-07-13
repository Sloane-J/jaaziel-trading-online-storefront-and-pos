import { MinusIcon, PlusIcon, ShoppingBagIcon, TrashIcon } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	useCart,
	useRemoveCartItem,
useUpdateCartItem,
} from "@/features/storefront/hooks/use-cart";
import { formatPrice } from "@/lib/format-price";

type CartDrawerProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
	const { data, isLoading } = useCart();
	const updateItem = useUpdateCartItem();
	const removeItem = useRemoveCartItem();

	const items = data?.items ?? [];
	const total = items.reduce(
		(sum, item) => sum + Number(item.product.price) * item.quantity,
		0,
	);

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
				<SheetHeader>
					<SheetTitle className="font-heading">Your cart</SheetTitle>
				</SheetHeader>

				{isLoading ? (
					<div className="flex-1 space-y-4 px-4 py-4">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
						))}
					</div>
				) : items.length === 0 ? (
					<div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
						<ShoppingBagIcon className="size-10 text-muted-foreground" />
						<p className="text-sm text-muted-foreground">Your cart is empty.</p>
						<Button
							variant="outline"
							size="sm"
							onClick={() => onOpenChange(false)}
							aschild
						>
							<Link to="/">Continue shopping</Link>
						</Button>
					</div>
				) : (
					<>
						<div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
							{items.map((item) => (
								<div key={item.id} className="flex gap-3">
									<div className="size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
										{item.product.images[0] ? (
											<img
												src={item.product.images[0]}
												alt={item.product.name}
												className="size-full object-cover"
											/>
										) : (
											<div className="size-full bg-muted" />
										)}
									</div>

									<div className="flex flex-1 flex-col justify-between">
										<div>
											<p className="truncate text-sm font-medium text-foreground">
												{item.product.name}
											</p>
											<p className="text-sm text-muted-foreground">
												{formatPrice(Number(item.product.price))}
											</p>
										</div>

										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<button
													type="button"
													onClick={() =>
														item.quantity > 1
															? updateItem.mutate({
																	id: item.id,
																	quantity: item.quantity - 1,
																})
															: removeItem.mutate(item.id)
													}
													aria-label="Decrease quantity"
													className="flex size-6 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-accent"
												>
													<MinusIcon className="size-3" />
												</button>
												<span className="w-4 text-center text-sm">
													{item.quantity}
												</span>
												<button
													type="button"
													onClick={() =>
														updateItem.mutate({
															id: item.id,
															quantity: item.quantity + 1,
														})
													}
													aria-label="Increase quantity"
													className="flex size-6 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-accent"
												>
													<PlusIcon className="size-3" />
												</button>
											</div>

											<button
												type="button"
												onClick={() => removeItem.mutate(item.id)}
												aria-label="Remove item"
												className="text-muted-foreground transition-colors hover:text-destructive"
											>
												<TrashIcon className="size-4" />
											</button>
										</div>
									</div>
								</div>
							))}
						</div>

						<div className="space-y-3 border-t border-border px-4 py-4">
							<div className="flex items-center justify-between text-sm font-medium">
								<span className="text-foreground">Total</span>
								<span className="text-foreground">{formatPrice(total)}</span>
							</div>
							<Button className="w-full" size="lg" disabled>
								Checkout (coming soon)
							</Button>
						</div>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}

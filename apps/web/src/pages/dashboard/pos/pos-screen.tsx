import { LayoutDashboardIcon, LogOutIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { CategoryTiles } from "@/features/pos/components/category-tiles";
import { PosInvoice } from "@/features/pos/components/pos-invoice";
import { PosProductTile } from "@/features/pos/components/pos-product-tile";
import { usePosCatalog } from "@/features/pos/hooks/use-pos";
import { usePosCart } from "@/features/pos/hooks/use-pos-cart";
import { useSession } from "@/hooks/use-session";
import { authClient } from "@/lib/auth-client";

export function PosScreen(): React.JSX.Element {
	const navigate = useNavigate();
	const { data: session } = useSession();
	const role = (session?.user as { role?: string } | undefined)?.role;

	const { data: catalog, isLoading } = usePosCatalog();
	const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
		null,
	);

	const {
		items,
		orderNumber,
		addItem,
		removeItem,
		deleteItem,
		clearSale,
		quantityOf,
		subtotal,
	} = usePosCart();

	const productsInCategory = useMemo(() => {
		if (!catalog || !selectedCategoryId) return [];
		return catalog.products.filter((p) => p.categoryId === selectedCategoryId);
	}, [catalog, selectedCategoryId]);

	async function handleLogout(): Promise<void> {
		await authClient.signOut();
		navigate("/login");
	}

	function handleAdd(productId: string) {
		const product = catalog?.products.find((p) => p.id === productId);
		if (product) addItem(product);
	}

	function handlePlaceOrder() {
		navigate("/pos/payment", {
			state: {
				orderNumber,
				items: items.map((item) => ({
					productId: item.product.id,
					name: item.product.name,
					quantity: item.quantity,
					unitPrice: item.product.price,
				})),
				subtotal,
			},
		});
	}

	return (
		<div className="flex h-screen flex-col bg-background">
			<header className="flex items-center justify-between border-b border-border px-6 py-4">
				<div className="flex items-center gap-4">
					<h1 className="font-heading text-lg font-semibold text-foreground">
						Point of Sale
					</h1>
					{role === "admin" && (
						<Link
							to="/admin"
							className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							<LayoutDashboardIcon className="size-3.5" />
							Back to dashboard
						</Link>
					)}
				</div>
				<button
					type="button"
					onClick={handleLogout}
					aria-label="Log out"
					className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-destructive transition-colors duration-200 ease-out hover:bg-destructive/10"
				>
					<LogOutIcon className="size-4" aria-hidden="true" />
					Log out
				</button>
			</header>

			<div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-4 md:grid-cols-[1fr_360px]">
				<div className="flex min-h-0 flex-col gap-4 overflow-hidden">
					{isLoading ? (
						<p className="text-sm text-muted-foreground">Loading catalog…</p>
					) : (
						<>
							<CategoryTiles
								categories={catalog?.categories ?? []}
								selectedId={selectedCategoryId}
								onSelect={setSelectedCategoryId}
							/>

							<div className="flex-1 overflow-y-auto">
								{!selectedCategoryId ? (
									<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
										Select a category to see products
									</div>
								) : productsInCategory.length === 0 ? (
									<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
										No products in this category
									</div>
								) : (
									<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
										{productsInCategory.map((product) => (
											<PosProductTile
												key={product.id}
												product={product}
												quantityInCart={quantityOf(product.id)}
												onAdd={() => handleAdd(product.id)}
												onRemove={() => removeItem(product.id)}
											/>
										))}
									</div>
								)}
							</div>
						</>
					)}
				</div>

				<PosInvoice
					orderNumber={orderNumber}
					items={items}
					subtotal={subtotal}
					onAdd={handleAdd}
					onRemove={removeItem}
					onDelete={deleteItem}
					onClearSale={clearSale}
					onPlaceOrder={handlePlaceOrder}
					isSubmitting={false}
				/>
			</div>
		</div>
	);
}

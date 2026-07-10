import {
	LayoutDashboardIcon,
	SearchIcon,
	ShoppingCartIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { CategoriesMenu } from "@/features/storefront/components/categories-menu";
import { useSession } from "@/hooks/use-session";

type StorefrontLayoutProps = {
	children: ReactNode;
};

const ROLE_HOME: Record<string, string> = {
	admin: "/admin",
	superadmin: "/superadmin",
	cashier: "/pos",
	staff: "/orders",
};

const OUTLINE_LINK_CLASS =
	"inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground";

export function StorefrontLayout({ children }: StorefrontLayoutProps) {
	const { data: session } = useSession();
	const role = (session?.user as { role?: string } | undefined)?.role;
	const dashboardHref = role ? ROLE_HOME[role] : undefined;

	return (
		<div className="min-h-screen bg-white">
			<header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur transition-shadow">
				<div className="mx-auto grid max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center gap-6 px-6 py-4">
					{/* Left: search bar */}
					<div className="relative max-w-xs">
						<SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
						<input
							type="search"
							placeholder="Search products..."
							aria-label="Search products"
							className="w-full rounded-full border border-input bg-muted/40 py-2 pl-9 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-background"
						/>
					</div>

					{/* Center: logo */}
					<Link
						to="/"
						className="whitespace-nowrap font-heading text-xl font-semibold text-foreground"
					>
						Jaaziel Trading
					</Link>

					{/* Right: nav links + cart + dashboard/login */}
					<div className="flex items-center justify-end gap-6">
						<nav
							aria-label="Main navigation"
							className="hidden items-center gap-6 lg:flex"
						>
							<CategoriesMenu />
							<Link
								to="/delivery"
								className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
							>
								Delivery
							</Link>
							<Link
								to="/contact"
								className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
							>
								Contact
							</Link>
						</nav>

						<Link
							to="/cart"
							aria-label="Cart"
							className="text-muted-foreground transition-colors hover:text-foreground"
						>
							<ShoppingCartIcon className="size-5" />
						</Link>

						{session && dashboardHref ? (
							<Link to={dashboardHref} className={OUTLINE_LINK_CLASS}>
								<LayoutDashboardIcon className="size-4" />
								Dashboard
							</Link>
						) : (
							<Link to="/login" className={OUTLINE_LINK_CLASS}>
								Log in
							</Link>
						)}
					</div>
				</div>
			</header>

			<main>{children}</main>

			<footer className="border-t border-border py-10">
				<div className="mx-auto max-w-[1600px] px-6 text-sm text-muted-foreground">
					© {new Date().getFullYear()} Jaaziel Trading Enterprise
				</div>
			</footer>
		</div>
	);
}

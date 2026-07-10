import {
	LayoutDashboardIcon,
	SearchIcon,
	ShoppingCartIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
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
			<header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
				<div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-6 py-4">
					<Link
						to="/"
						className="font-heading text-xl font-semibold text-foreground"
					>
						Jaaziel Trading
					</Link>

					<nav
						aria-label="Main navigation"
						className="hidden items-center gap-6 md:flex"
					>
						<Link
							to="/"
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							Shop
						</Link>
					</nav>

					<div className="flex items-center gap-2">
						<Button variant="ghost" size="icon" aria-label="Search">
							<SearchIcon className="size-5" />
						</Button>
						<Button variant="ghost" size="icon" aria-label="Cart">
							<ShoppingCartIcon className="size-5" />
						</Button>

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

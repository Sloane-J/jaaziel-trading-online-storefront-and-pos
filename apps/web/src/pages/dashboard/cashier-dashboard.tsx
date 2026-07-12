import { LayoutDashboardIcon, LogOutIcon } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useSession } from "@/hooks/use-session";
import { authClient } from "@/lib/auth-client";

export function CashierDashboard(): React.JSX.Element {
	const navigate = useNavigate();
	const { data: session } = useSession();
	const role = (session?.user as { role?: string } | undefined)?.role;

	async function handleLogout(): Promise<void> {
		await authClient.signOut();
		navigate("/login");
	}

	return (
		<div className="flex min-h-screen flex-col bg-background">
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
			<main className="flex-1 p-6">
				<p className="text-sm text-muted-foreground">POS screen coming soon</p>
			</main>
		</div>
	);
}

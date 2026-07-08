import { LogOutIcon } from "lucide-react";
import type { JSX, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

type NavItem = {
	label: string;
	href: string;
};

type DashboardLayoutProps = {
	title: string;
	navItems: NavItem[];
	children: ReactNode;
};

export function DashboardLayout({
	title,
	navItems,
	children,
}: DashboardLayoutProps): JSX.Element {
	const navigate = useNavigate();
	const location = useLocation();

	async function handleLogout(): Promise<void> {
		await authClient.signOut();
		navigate("/login");
	}

	return (
		<SidebarProvider>
			<Sidebar>
				<SidebarHeader>
					<span className="px-2 py-1 text-sm font-semibold text-sidebar-foreground">
						{title}
					</span>
				</SidebarHeader>

				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>Navigation</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{navItems.map((item) => (
									<SidebarMenuItem key={item.href}>
										<SidebarMenuButton
											isActive={location.pathname === item.href}
											render={<Link to={item.href}>{item.label}</Link>}
										/>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>

				<SidebarFooter>
					<Button
						type="button"
						variant="ghost"
						onClick={handleLogout}
						aria-label="Log out"
						className="w-full justify-start gap-2 text-destructive hover:text-destructive"
					>
						<LogOutIcon className="size-4" aria-hidden="true" />
						Log out
					</Button>
				</SidebarFooter>
			</Sidebar>

			<SidebarInset>
				<header className="flex items-center gap-2 border-b border-border px-4 py-3">
					<SidebarTrigger />
				</header>
				<main className="flex-1 p-8">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}

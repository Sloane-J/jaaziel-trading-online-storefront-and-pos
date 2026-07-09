import type { LucideIcon } from "lucide-react";import {
	BarChart3Icon,
	BellIcon,
	CircleDotIcon,
	CreditCardIcon,
	FileTextIcon,
	FolderIcon,
	LayoutDashboardIcon,
	LogOutIcon,
	SettingsIcon,
	UserIcon,
	UsersIcon,
} from "lucide-react";

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
	icon?: LucideIcon;
};

type DashboardLayoutProps = {
	title: string;
	subtitle?: string;
	navItems: NavItem[];
	children: ReactNode;
};

// Fallback icons keyed by common label text, used only when a NavItem
// doesn't supply its own `icon`. Keeps the sidebar from ever rendering
// an unlabeled item while letting callers override per-item.
const FALLBACK_ICONS: Record<string, LucideIcon> = {
	dashboard: LayoutDashboardIcon,
	overview: LayoutDashboardIcon,
	home: LayoutDashboardIcon,
	users: UsersIcon,
	team: UsersIcon,
	people: UsersIcon,
	settings: SettingsIcon,
	reports: BarChart3Icon,
	analytics: BarChart3Icon,
	billing: CreditCardIcon,
	payments: CreditCardIcon,
	profile: UserIcon,
	account: UserIcon,
	documents: FileTextIcon,
	files: FolderIcon,
	notifications: BellIcon,
};

function resolveIcon(item: NavItem): LucideIcon {
	if (item.icon) return item.icon;
	return FALLBACK_ICONS[item.label.trim().toLowerCase()] ?? CircleDotIcon;
}

export function DashboardLayout({
	title,
	subtitle,
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
			<Sidebar className="border-r border-sidebar-border bg-sidebar">
				<SidebarHeader className="gap-1 px-4 py-5">
					<span className="font-heading text-lg font-semibold leading-tight text-sidebar-foreground">
						{title}
					</span>
					{subtitle ? (
						<span className="font-sans text-xs font-medium uppercase tracking-wide text-muted-foreground">
							{subtitle}
						</span>
					) : null}
				</SidebarHeader>

				<SidebarContent className="px-3">
					<SidebarGroup>
						<SidebarGroupLabel className="font-sans text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Navigation
						</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu className="gap-1">
								{navItems.map((item) => {
									const isActive = location.pathname === item.href;
									const Icon = resolveIcon(item);

									return (
										<SidebarMenuItem key={item.href}>
											<SidebarMenuButton
												isActive={isActive}
												className={[
													"rounded-sm transition-all duration-200 ease-out",
													"hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm",
													isActive
														? "bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground"
														: "text-sidebar-foreground",
												].join(" ")}
												render={
													<Link
														to={item.href}
														className="flex items-center gap-2"
													>
														<Icon
															className="size-4 shrink-0"
															aria-hidden="true"
														/>
														<span className="font-sans text-sm">
															{item.label}
														</span>
													</Link>
												}
											/>
										</SidebarMenuItem>
									);
								})}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>

				<SidebarFooter className="px-3 pb-4">
					<Button
						type="button"
						variant="ghost"
						onClick={handleLogout}
						aria-label="Log out"
						className="w-full justify-start gap-2 rounded-sm text-destructive transition-colors duration-200 ease-out hover:bg-destructive/10 hover:text-destructive"
					>
						<LogOutIcon className="size-4" aria-hidden="true" />
						Log out
					</Button>
				</SidebarFooter>
			</Sidebar>

			<SidebarInset className="bg-background">
				<header className="flex items-center gap-2 border-b border-border px-4 py-3">
					<SidebarTrigger className="rounded-sm transition-colors duration-200 ease-out hover:bg-accent hover:text-accent-foreground" />
				</header>
				<main className="flex-1 p-8">
					<div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
						{children}
					</div>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}

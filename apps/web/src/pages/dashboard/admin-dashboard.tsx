import {
  BarChart3Icon,
  LayersIcon,
  LayoutDashboardIcon,
  PackageIcon,
  SettingsIcon,
  ShoppingCartIcon,
  UsersIcon,
} from "lucide-react";
import { DashboardLayout } from "@/components/shared/dashboard-layout";

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboardIcon },
  { label: "Products", href: "/admin/products", icon: PackageIcon },
  { label: "Categories", href: "/admin/categories", icon: LayersIcon },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCartIcon },
  { label: "Staff", href: "/admin/staff", icon: UsersIcon },
  { label: "Reports", href: "/admin/reports", icon: BarChart3Icon },
  { label: "Settings", href: "/admin/settings", icon: SettingsIcon },
];

export function AdminDashboard(): React.JSX.Element {
  return (
    <DashboardLayout title="Jaaziel Admin" navItems={navItems}>
      <h1 className="font-heading text-lg font-semibold text-foreground">
        Admin Dashboard Overview
      </h1>
    </DashboardLayout>
  );
}
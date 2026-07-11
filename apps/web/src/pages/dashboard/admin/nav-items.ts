import {
  BarChart3Icon,
  LayersIcon,
  LayoutDashboardIcon,
  MonitorIcon,
  PackageIcon,
  SettingsIcon,
  ShoppingCartIcon,
  StoreIcon,
  UsersIcon,
} from "lucide-react";

export const adminNavItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboardIcon },
  { label: "Products", href: "/admin/products", icon: PackageIcon },
  { label: "Categories", href: "/admin/categories", icon: LayersIcon },
  { label: "Storefront", href: "/admin/storefront", icon: StoreIcon },
  { label: "POS", href: "/pos", icon: MonitorIcon },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCartIcon },
  { label: "Staff", href: "/admin/staff", icon: UsersIcon },
  { label: "Reports", href: "/admin/reports", icon: BarChart3Icon },
  { label: "Settings", href: "/admin/settings", icon: SettingsIcon },
];
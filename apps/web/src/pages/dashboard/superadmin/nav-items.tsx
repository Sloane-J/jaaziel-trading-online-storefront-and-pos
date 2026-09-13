import {
  ActivityIcon,
  Building2Icon,
  DatabaseIcon,
  LayoutDashboardIcon,
  ReceiptTextIcon,
  SettingsIcon,
  StoreIcon,
} from "lucide-react";

export const superadminNavItems = [
  { label: "Overview", href: "/superadmin", icon: LayoutDashboardIcon },
  { label: "Orders & Payments", href: "/superadmin/orders", icon: ReceiptTextIcon },
  { label: "Data Integrity", href: "/superadmin/data-integrity", icon: DatabaseIcon },
  { label: "Storefront Settings", href: "/superadmin/storefront", icon: StoreIcon },
  { label: "System Health", href: "/superadmin/health", icon: ActivityIcon },
  { label: "Multi-Tenant", href: "/superadmin/multi-tenant", icon: Building2Icon },
  { label: "Settings", href: "/superadmin/settings", icon: SettingsIcon },
];
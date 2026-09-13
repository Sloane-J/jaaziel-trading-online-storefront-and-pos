import {
  ActivityIcon,
  Building2Icon,
  DatabaseIcon,
  LayoutDashboardIcon,
  ReceiptTextIcon,
  SettingsIcon,
  StoreIcon,
} from "lucide-react";
import { DashboardLayout } from "@/components/shared/dashboard-layout";

const navItems = [
  { label: "Overview", href: "/superadmin", icon: LayoutDashboardIcon },
  { label: "Orders & Payments", href: "/superadmin/orders", icon: ReceiptTextIcon },
  { label: "Data Integrity", href: "/superadmin/data-integrity", icon: DatabaseIcon },
  { label: "Storefront Settings", href: "/superadmin/storefront", icon: StoreIcon },
  { label: "System Health", href: "/superadmin/health", icon: ActivityIcon },
  { label: "Multi-Tenant", href: "/superadmin/multi-tenant", icon: Building2Icon },
  { label: "Settings", href: "/superadmin/settings", icon: SettingsIcon },
];

export function SuperadminDashboard(): React.JSX.Element {
  return (
    <DashboardLayout title="Superadmin" navItems={navItems}>
      <h1 className="font-heading text-lg font-semibold text-foreground">
        Superadmin Overview
      </h1>
    </DashboardLayout>
  );
}
import {
  ActivityIcon,
  Building2Icon,
  ScrollTextIcon,
  SettingsIcon,
} from "lucide-react";
import { DashboardLayout } from "@/components/shared/dashboard-layout";

const navItems = [
  { label: "Tenants", href: "/superadmin", icon: Building2Icon },
  { label: "System Health", href: "/superadmin/health", icon: ActivityIcon },
  { label: "Logs", href: "/superadmin/logs", icon: ScrollTextIcon },
  { label: "Settings", href: "/superadmin/settings", icon: SettingsIcon },
];

export function SuperadminDashboard(): React.JSX.Element {
  return (
    <DashboardLayout title="Superadmin" navItems={navItems}>
      <h1 className="font-heading text-lg font-semibold text-foreground">
        Superadmin Dashboard
      </h1>
    </DashboardLayout>
  );
}
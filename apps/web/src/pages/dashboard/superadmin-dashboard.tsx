import { DashboardLayout } from "@/components/shared/dashboard-layout";

const navItems = [
  { label: "Tenants", href: "/superadmin" },
  { label: "System Health", href: "/superadmin/health" },
  { label: "Logs", href: "/superadmin/logs" },
  { label: "Settings", href: "/superadmin/settings" },
];

export function SuperadminDashboard(): React.JSX.Element {
  return (
    <DashboardLayout title="Superadmin" navItems={navItems}>
      <h1 className="text-lg font-semibold text-foreground">Superadmin Dashboard</h1>
    </DashboardLayout>
  );
}
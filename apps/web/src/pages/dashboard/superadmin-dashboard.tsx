import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { superadminNavItems } from "@/pages/dashboard/superadmin/nav-items";

export function SuperadminDashboard(): React.JSX.Element {
  return (
    <DashboardLayout title="Superadmin" navItems={superadminNavItems}>
      <h1 className="font-heading text-lg font-semibold text-foreground">
        Superadmin Overview
      </h1>
    </DashboardLayout>
  );
}
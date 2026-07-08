import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { adminNavItems } from "@/pages/dashboard/admin/nav-items";

export function AdminDashboard(): React.JSX.Element {
  return (
    <DashboardLayout title="Jaaziel Admin" navItems={adminNavItems}>
      <h1 className="font-heading text-lg font-semibold text-foreground">
        Admin Dashboard Overview
      </h1>
    </DashboardLayout>
  );
}
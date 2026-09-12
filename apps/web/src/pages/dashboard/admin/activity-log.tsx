import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { ActivityLogTable } from "@/features/admin/components/activity-log-table";
import { adminNavItems } from "@/pages/dashboard/admin/nav-items";

export function AdminActivityLogPage(): React.JSX.Element {
  return (
    <DashboardLayout title="Jaaziel Admin" navItems={adminNavItems}>
      <ActivityLogTable />
    </DashboardLayout>
  );
}
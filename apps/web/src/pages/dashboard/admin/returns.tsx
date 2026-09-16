import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { ReturnsTable } from "@/features/admin/components/returns-table";
import { adminNavItems } from "@/pages/dashboard/admin/nav-items";

export function AdminReturnsPage(): React.JSX.Element {
  return (
    <DashboardLayout title="Jaaziel Admin" navItems={adminNavItems}>
      <ReturnsTable />
    </DashboardLayout>
  );
}
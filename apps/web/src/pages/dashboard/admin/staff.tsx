import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { StaffTable } from "@/features/admin/components/staff-table";
import { adminNavItems } from "@/pages/dashboard/admin/nav-items";

export function AdminStaffPage(): React.JSX.Element {
  return (
    <DashboardLayout title="Jaaziel Admin" navItems={adminNavItems}>
      <StaffTable />
    </DashboardLayout>
  );
}
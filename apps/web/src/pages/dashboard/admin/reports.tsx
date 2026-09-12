import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { ReportsPageContent } from "@/features/admin/components/reports-page-content";
import { adminNavItems } from "@/pages/dashboard/admin/nav-items";

export function AdminReportsPage(): React.JSX.Element {
  return (
    <DashboardLayout title="Jaaziel Admin" navItems={adminNavItems}>
      <ReportsPageContent />
    </DashboardLayout>
  );
}
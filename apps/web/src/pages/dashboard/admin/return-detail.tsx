import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { ReturnDetailContent } from "@/features/admin/components/return-detail-content";
import { adminNavItems } from "@/pages/dashboard/admin/nav-items";

export function AdminReturnDetailPage(): React.JSX.Element {
  return (
    <DashboardLayout title="Jaaziel Admin" navItems={adminNavItems}>
      <ReturnDetailContent />
    </DashboardLayout>
  );
}
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { SuperadminOrdersContent } from "@/features/superadmin/components/superadmin-orders-content";
import { superadminNavItems } from "@/pages/dashboard/superadmin/nav-items";

export function SuperadminOrdersPage(): React.JSX.Element {
  return (
    <DashboardLayout title="Superadmin" navItems={superadminNavItems}>
      <SuperadminOrdersContent />
    </DashboardLayout>
  );
}
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { PropertySubmissionsContent } from "@/features/admin/components/property-submissions-content";
import { adminNavItems } from "@/pages/dashboard/admin/nav-items";

export function AdminPropertySubmissionsPage(): React.JSX.Element {
  return (
    <DashboardLayout title="Jaaziel Admin" navItems={adminNavItems}>
      <PropertySubmissionsContent />
    </DashboardLayout>
  );
}
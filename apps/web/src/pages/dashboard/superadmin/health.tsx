import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { SystemHealthContent } from "@/features/superadmin/components/system-health-content";
import { superadminNavItems } from "@/pages/dashboard/superadmin/nav-items";

export function SuperadminHealthPage(): React.JSX.Element {
  return (
    <DashboardLayout title="Superadmin" navItems={superadminNavItems}>
      <SystemHealthContent />
    </DashboardLayout>
  );
}
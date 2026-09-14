import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DataIntegrityContent } from "@/features/superadmin/components/data-integrity-content";
import { superadminNavItems } from "@/pages/dashboard/superadmin/nav-items";

export function SuperadminDataIntegrityPage(): React.JSX.Element {
  return (
    <DashboardLayout title="Superadmin" navItems={superadminNavItems}>
      <DataIntegrityContent />
    </DashboardLayout>
  );
}
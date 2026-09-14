import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { StorefrontDiagnosticsContent } from "@/features/superadmin/components/storefront-diagnostics-content";
import { superadminNavItems } from "@/pages/dashboard/superadmin/nav-items";

export function SuperadminStorefrontPage(): React.JSX.Element {
  return (
    <DashboardLayout title="Superadmin" navItems={superadminNavItems}>
      <StorefrontDiagnosticsContent />
    </DashboardLayout>
  );
}
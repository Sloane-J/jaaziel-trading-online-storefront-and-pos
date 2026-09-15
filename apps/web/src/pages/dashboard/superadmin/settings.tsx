import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { ProfileSettingsPanel } from "@/features/admin/components/profile-settings-panel";
import { superadminNavItems } from "@/pages/dashboard/superadmin/nav-items";

export function SuperadminSettingsPage(): React.JSX.Element {
  return (
    <DashboardLayout title="Superadmin" navItems={superadminNavItems}>
      <div className="space-y-6">
        <h2 className="text-2xl font-heading">Settings</h2>
        <ProfileSettingsPanel />
      </div>
    </DashboardLayout>
  );
}
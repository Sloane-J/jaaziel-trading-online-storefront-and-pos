import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { StorefrontSettingsForm } from "@/features/admin/components/storefront-settings-form";
import { adminNavItems } from "@/pages/dashboard/admin/nav-items";

export function AdminStorefrontPage(): React.JSX.Element {
	return (
		<DashboardLayout title="Jaaziel Admin" navItems={adminNavItems}>
			<StorefrontSettingsForm />
		</DashboardLayout>
	);
}

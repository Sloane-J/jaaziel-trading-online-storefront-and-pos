import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { CategoriesTable } from "@/features/admin/components/categories-table";
import { adminNavItems } from "@/pages/dashboard/admin/nav-items";

export function AdminCategoriesPage(): React.JSX.Element {
	return (
		<DashboardLayout title="Jaaziel Admin" navItems={adminNavItems}>
			<CategoriesTable />
		</DashboardLayout>
	);
}

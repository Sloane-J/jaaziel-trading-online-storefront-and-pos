import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { ProductsTable } from "@/features/admin/components/products-table";
import { adminNavItems } from "@/pages/dashboard/admin/nav-items";

export function AdminProductsPage(): React.JSX.Element {
	return (
		<DashboardLayout title="Jaaziel Admin" navItems={adminNavItems}>
			<ProductsTable />
		</DashboardLayout>
	);
}

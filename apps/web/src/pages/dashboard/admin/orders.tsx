import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { OrdersList } from "@/features/admin/components/orders-list";
import { adminNavItems } from "@/pages/dashboard/admin/nav-items";

export function AdminOrdersPage(): React.JSX.Element {
  return (
    <DashboardLayout title="Jaaziel Admin" navItems={adminNavItems}>
      <OrdersList />
    </DashboardLayout>
  );
}

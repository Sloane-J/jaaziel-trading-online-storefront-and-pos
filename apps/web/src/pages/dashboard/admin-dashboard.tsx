import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { OverviewStats } from "@/features/admin/components/overview-stats";
import { RecentOrders } from "@/features/admin/components/recent-orders";
import { SalesChart } from "@/features/admin/components/sales-chart";
import { adminNavItems } from "@/pages/dashboard/admin/nav-items";

export function AdminDashboard(): React.JSX.Element {
  return (
    <DashboardLayout title="Jaaziel Admin" navItems={adminNavItems}>
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Overview
        </h1>
        <OverviewStats />
        <SalesChart />
        <RecentOrders />
      </div>
    </DashboardLayout>
  );
}

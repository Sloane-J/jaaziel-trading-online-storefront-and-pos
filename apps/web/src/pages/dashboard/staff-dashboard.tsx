import { DashboardLayout } from "@/components/shared/dashboard-layout";

const navItems = [{ label: "Order Queue", href: "/orders" }];

export function StaffDashboard(): React.JSX.Element {
  return (
    <DashboardLayout title="Staff" navItems={navItems}>
      <h1 className="text-lg font-semibold text-foreground">Staff Order Queue</h1>
    </DashboardLayout>
  );
}
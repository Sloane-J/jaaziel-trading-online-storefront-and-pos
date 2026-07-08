import { DashboardLayout } from "@/components/shared/dashboard-layout";

const navItems = [
  { label: "Overview", href: "/admin" },
  { label: "Products", href: "/admin/products" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Staff", href: "/admin/staff" },
  { label: "Reports", href: "/admin/reports" },
  { label: "Settings", href: "/admin/settings" },
];

export function AdminDashboard(): React.JSX.Element {
  return (
    <DashboardLayout title="Jaaziel Admin" navItems={navItems}>
      <h1 className="text-lg font-semibold text-foreground">Admin Dashboard Overview</h1>
    </DashboardLayout>
  );
}
import { Building2Icon } from "lucide-react";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { superadminNavItems } from "@/pages/dashboard/superadmin/nav-items";

export function SuperadminMultiTenantPage(): React.JSX.Element {
  return (
    <DashboardLayout title="Superadmin" navItems={superadminNavItems}>
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary-light text-primary-light-foreground">
          <Building2Icon className="size-6" />
        </div>
        <h2 className="text-xl font-heading font-semibold text-foreground">
          Multi-Tenant Management
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Coming soon. This will let you manage multiple businesses on one
          platform — creating tenants, per-tenant branding, and switching
          between them.
        </p>
      </div>
    </DashboardLayout>
  );
}
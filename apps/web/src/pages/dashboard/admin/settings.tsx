import { useState } from "react";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { ProfileSettingsPanel } from "@/features/admin/components/profile-settings-panel";
import { adminNavItems } from "@/pages/dashboard/admin/nav-items";

type SettingsSection = "store" | "profile" | "appearance";

const SECTIONS: { value: SettingsSection; label: string; comingSoon: boolean }[] = [
  { value: "store", label: "Store Settings", comingSoon: true },
  { value: "profile", label: "Profile Settings", comingSoon: false },
  { value: "appearance", label: "Appearance", comingSoon: true },
];

export function AdminSettingsPage(): React.JSX.Element {
  const [section, setSection] = useState<SettingsSection>("profile");

  return (
    <DashboardLayout title="Jaaziel Admin" navItems={adminNavItems}>
      <div className="space-y-6">
        <h2 className="text-2xl font-heading">Settings</h2>

        <div className="flex gap-1 border-b border-border">
          {SECTIONS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSection(s.value)}
              aria-current={section === s.value}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                section === s.value
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
              {s.comingSoon && (
                <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Soon
                </span>
              )}
              {section === s.value && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {section === "store" && (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">
              Store settings — coming soon. This will let you customize your store name and logo.
            </p>
          </div>
        )}

        {section === "profile" && <ProfileSettingsPanel />}

        {section === "appearance" && (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">
              Appearance — coming soon. Theme customization for your storefront.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
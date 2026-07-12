import { useState } from "react";
import { SecuritySettingsForm } from "@/features/admin/components/security-settings-form";

type Tab = "profile" | "security";

export function ProfileSettingsPanel() {
  const [tab, setTab] = useState<Tab>("security");

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
      <div className="flex gap-1 md:flex-col">
        <button
          type="button"
          onClick={() => setTab("profile")}
          className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
            tab === "profile"
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:bg-accent/50"
          }`}
        >
          Profile
        </button>
        <button
          type="button"
          onClick={() => setTab("security")}
          className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
            tab === "security"
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:bg-accent/50"
          }`}
        >
          Security
        </button>
      </div>

      <div>
        {tab === "profile" ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">
              Profile details — coming soon. Update your name here later.
            </p>
          </div>
        ) : (
          <SecuritySettingsForm />
        )}
      </div>
    </div>
  );
}
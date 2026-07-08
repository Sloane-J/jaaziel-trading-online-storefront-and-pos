import { LogOutIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { authClient } from "@/lib/auth-client";

export function CashierDashboard(): React.JSX.Element {
  const navigate = useNavigate();

  async function handleLogout(): Promise<void> {
    await authClient.signOut();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <h1 className="font-heading text-lg font-semibold text-foreground">
          Point of Sale
        </h1>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-destructive transition-colors duration-200 ease-out hover:bg-destructive/10"
        >
          <LogOutIcon className="size-4" aria-hidden="true" />
          Log out
        </button>
      </header>
      <main className="flex-1 p-6">
        <p className="text-sm text-muted-foreground">POS screen coming soon</p>
      </main>
    </div>
  );
}
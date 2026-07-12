import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { useSession } from "@/hooks/use-session";

function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-foreground"
      >
        {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
      </button>
    </div>
  );
}

export function SecuritySettingsForm() {
  const { data: session } = useSession();
  const currentEmail = session?.user?.email ?? "";

  // Email change state
  const [newEmail, setNewEmail] = useState("");
  const [emailConfirmPassword, setEmailConfirmPassword] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [emailError, setEmailError] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError(null);

    if (!newEmail.trim() || newEmail === currentEmail) {
      setEmailError("Enter a different email address.");
      return;
    }
    if (!emailConfirmPassword) {
      setEmailError("Enter your current password to confirm this change.");
      return;
    }

    setEmailStatus("saving");

    // Re-verify identity using the current password before allowing the change.
    const { error: signInError } = await authClient.signIn.email({
      email: currentEmail,
      password: emailConfirmPassword,
    });

    if (signInError) {
      setEmailStatus("error");
      setEmailError("Incorrect password. Email was not changed.");
      return;
    }

    const { error: changeError } = await authClient.changeEmail({
      newEmail,
    });

    if (changeError) {
      setEmailStatus("error");
      setEmailError(changeError.message ?? "Could not update email. Please try again.");
      return;
    }

    setEmailStatus("saved");
    setNewEmail("");
    setEmailConfirmPassword("");
    setTimeout(() => setEmailStatus("idle"), 2500);
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setPasswordStatus("saving");

    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });

    if (error) {
      setPasswordStatus("error");
      setPasswordError(error.message ?? "Could not update password. Please try again.");
      return;
    }

    setPasswordStatus("saved");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordStatus("idle"), 2500);
  }

  return (
    <div className="space-y-8">
      {/* Email */}
      <form onSubmit={handleEmailSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Email address</h3>
          <p className="text-sm text-muted-foreground">
            Currently signed in as <span className="font-medium text-foreground">{currentEmail}</span>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-email">New email</Label>
          <Input
            id="new-email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-confirm-password">Confirm with your password</Label>
          <PasswordInput
            id="email-confirm-password"
            value={emailConfirmPassword}
            onChange={setEmailConfirmPassword}
            autoComplete="current-password"
          />
        </div>

        {emailError && (
          <p role="alert" className="text-sm text-destructive">
            {emailError}
          </p>
        )}
        {emailStatus === "saved" && (
          <p className="text-sm text-primary">Email updated.</p>
        )}

        <Button type="submit" disabled={emailStatus === "saving"}>
          {emailStatus === "saving" ? "Updating..." : "Update email"}
        </Button>
      </form>

      {/* Password */}
      <form onSubmit={handlePasswordSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Password</h3>
          <p className="text-sm text-muted-foreground">
            Choose a strong password you don't use elsewhere.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="current-password">Current password</Label>
          <PasswordInput
            id="current-password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <PasswordInput
            id="new-password"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <PasswordInput
            id="confirm-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
          />
        </div>

        {passwordError && (
          <p role="alert" className="text-sm text-destructive">
            {passwordError}
          </p>
        )}
        {passwordStatus === "saved" && (
          <p className="text-sm text-primary">Password updated. Other devices have been signed out.</p>
        )}

        <Button type="submit" disabled={passwordStatus === "saving"}>
          {passwordStatus === "saving" ? "Updating..." : "Update password"}
        </Button>
      </form>
    </div>
  );
}
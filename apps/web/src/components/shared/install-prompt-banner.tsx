import { DownloadIcon, ShareIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

const DISMISS_KEY = "pwa-install-dismissed";
const SHOW_DELAY_MS = 12000;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIOSSafari(): boolean {
  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIOS && isSafari;
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function InstallPromptBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const onIOS = isIOSSafari();
    if (onIOS) setShowIOSInstructions(true);

    const timer = window.setTimeout(() => {
      // Only reveal the banner once we know there's something to show:
      // a captured Chromium prompt, or iOS Safari with manual steps.
      setVisible((prev) => prev || onIOS);
    }, SHOW_DELAY_MS);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (deferredPrompt) {
      const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
      return () => window.clearTimeout(timer);
    }
  }, [deferredPrompt]);

  function handleDismiss() {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted" || outcome === "dismissed") {
      localStorage.setItem(DISMISS_KEY, "1");
    }
    setDeferredPrompt(null);
    setVisible(false);
  }

  if (!visible || (!deferredPrompt && !showIOSInstructions)) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-80">
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-xl">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary-light-foreground">
          <DownloadIcon className="size-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            Install Jaaziel Trading
          </p>

          {showIOSInstructions ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Tap{" "}
              <ShareIcon className="mb-0.5 inline size-3.5" aria-hidden="true" />{" "}
              Share, then "Add to Home Screen" for quick access.
            </p>
          ) : (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Add our app to your home screen for faster access.
            </p>
          )}

          {!showIOSInstructions && deferredPrompt && (
            <button
              type="button"
              onClick={handleInstall}
              className="mt-3 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Install
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
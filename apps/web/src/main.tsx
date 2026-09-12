import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { registerSW } from "virtual:pwa-register";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getQueryClient } from "@/lib/get-query-client";
import App from "./App";
import "./index.css";
import "./storefront-theme.css";

const queryClient = getQueryClient();

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<TooltipProvider>
					<App />
				</TooltipProvider>
			</BrowserRouter>
		</QueryClientProvider>
	</StrictMode>,
);

// Registers the service worker after the app has mounted, so it never
// competes with or delays the initial render/interactivity.
// registerType: "prompt" (set in vite.config.ts) means this won't
// auto-reload the page on update — onNeedRefresh is where we'll later
// hook in an "update available" UI if wanted.
if ("serviceWorker" in navigator) {
	registerSW({
		immediate: false,
		onRegisteredSW(_swUrl, registration) {
			// Check for a new service worker version periodically, without
			// forcing a reload — keeps stale tabs from silently drifting too
			// far behind a new deploy.
			if (registration) {
				setInterval(() => registration.update(), 60 * 60 * 1000);
			}
		},
	});
}
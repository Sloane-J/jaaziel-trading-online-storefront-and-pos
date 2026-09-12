import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			registerType: "prompt",
			injectRegister: false,
			manifest: false, // we already link our own /manifest.json in index.html
			workbox: {
				navigateFallback: "/offline.html",
				navigateFallbackDenylist: [/^\/api\//],
				globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
			},
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		cors: false,
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("node_modules")) {
						if (id.includes("react-router") || id.includes("react-dom") || id.includes("/react/")) {
							return "react-vendor";
						}
						if (id.includes("@tanstack/react-query")) {
							return "query-vendor";
						}
						if (id.includes("recharts")) {
							return "charts-vendor";
						}
					}
				},
			},
		},
	},
});
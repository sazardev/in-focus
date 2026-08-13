import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
	plugins: [react()],

	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},

	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./vitest.setup.ts"],
		css: true,
	},

	// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
	//
	// 1. prevent Vite from obscuring rust errors
	clearScreen: false,

	build: {
		// Separa el vendor en chunks cacheables y carga en paralelo (el motor
		// de Yarn, React y las librerías no se mezclan con el código de la app).
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("node_modules/yarn-spinner")) return "yarn";
					if (id.includes("node_modules/@tanstack/react-virtual")) return "virtual";
					if (id.includes("node_modules/zustand")) return "state";
					if (id.includes("node_modules/@tauri-apps")) return "tauri";
					if (
						id.includes("node_modules/react-dom") ||
						id.includes("node_modules/react/") ||
						id.includes("node_modules/scheduler")
					) {
						return "react";
					}
				},
			},
		},
	},

	// 2. tauri expects a fixed port, fail if that port is not available
	server: {
		port: 5174,
		strictPort: true,
		host: host || false,
		hmr: host
			? {
					protocol: "ws",
					host,
					port: 1421,
				}
			: undefined,
		watch: {
			// 3. tell Vite to ignore watching `src-tauri`
			ignored: ["**/src-tauri/**"],
		},
	},
}));

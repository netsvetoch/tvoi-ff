import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
// import mkcert from "vite-plugin-mkcert";

// https://vite.dev/config/
export default defineConfig({
	optimizeDeps: {
		entries: ["index.html", "!repos/**"],
	},
	plugins: [
		react(),
		babel({
			presets: [reactCompilerPreset()],
		}),
		// mkcert()
	],
	resolve: {
		alias: {
			"@": path.resolve(import.meta.dirname, "./src"),
		},
	},
	// server: {
	// 	host: "127.0.0.1",
	// 	port: 443,
	// },
});

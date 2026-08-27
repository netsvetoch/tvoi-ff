import { defineConfig } from "dpdm";

export default defineConfig({
	exitCode: "circular:1",
	files: ["./src/app/main.tsx"],
	progress: false,
	transform: true,
	tree: false,
	warning: false,
});

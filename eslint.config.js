import baseConfig from "@bpa-dev/eslint-config/react";
import { defineConfig } from "eslint/config";

export default defineConfig([
	{ ignores: ["src/shared/api/**"] },
	...baseConfig,
	{
		rules: {
			"unicorn/filename-case": "off",
		},
		settings: {
			"import/resolver": {
				typescript: {
					alwaysTryTypes: true,
					project: "./tsconfig.app.json",
				},
			},
		},
	},
]);

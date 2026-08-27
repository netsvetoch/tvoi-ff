import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import perfectionist from "eslint-plugin-perfectionist";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
// @ts-expect-error no types
import pluginPromise from "eslint-plugin-promise";
import reactHooks from "eslint-plugin-react-hooks";
// @ts-expect-error no types
import pluginSecurity from "eslint-plugin-security";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";
import { configs as tseslint } from "typescript-eslint";

export default defineConfig([
	{
		ignores: ["**/*.d.ts", "dist", "node_modules", "src/shared/api", "repos"],
	},
	{ files: ["**/*.{js,mjs,cjs,ts}"] },
	{
		extends: ["js/recommended"],
		files: ["**/*.{js,mjs,cjs,ts}"],
		plugins: { js },
	},
	tseslint.recommended,
	perfectionist.configs["recommended-natural"],
	importPlugin.flatConfigs.recommended,
	importPlugin.flatConfigs.typescript,
	eslintPluginPrettier,
	eslintPluginUnicorn.configs.all,
	pluginSecurity.configs.recommended,
	pluginPromise.configs["flat/recommended"],
	{
		plugins: {
			"react-hooks": reactHooks,
		},
		rules: { ...reactHooks.configs.recommended.rules },
	},
	{
		rules: {
			"@typescript-eslint/consistent-type-imports": "error",
			"@typescript-eslint/no-non-null-assertion": "error",
			"import/no-unresolved": ["error", { ignore: ["^/"] }],
			"react-hooks/exhaustive-deps": "error",
			"unicorn/filename-case": "off",
			"unicorn/no-array-callback-reference": "off",
			"unicorn/no-array-reduce": "off",
			"unicorn/no-keyword-prefix": "off",
			"unicorn/no-null": "off",
			"unicorn/no-useless-undefined": "off",
			"unicorn/number-literal-case": "off",
			"unicorn/prefer-ternary": "off",
			"unicorn/prevent-abbreviations": "off",
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

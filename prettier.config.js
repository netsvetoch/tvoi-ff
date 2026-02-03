import baseConfig from "@bpa-dev/eslint-config/prettier";
/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
	...baseConfig,
	jsxSingleQuote: false,
	semi: true,
	singleQuote: false,
	trailingComma: "es5",
};

export default config;

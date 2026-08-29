import type { KnipConfig } from "knip";

export default {
	ignore: ["dpdm.config.ts", "src/shared/api/**", "repos/**"],
	ignoreDependencies: ["@hey-api/openapi-ts"],
	project: ["**/*.{js,ts,tsx,sass,scss}"],
} satisfies KnipConfig;

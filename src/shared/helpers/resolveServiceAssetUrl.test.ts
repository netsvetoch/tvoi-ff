import { describe, expect, it } from "vitest";

import { resolveServiceAssetUrl } from "./resolveServiceAssetUrl";

describe("resolveServiceAssetUrl", () => {
	const baseUrl = "https://api.test.profcomff.com/achievement";

	it("keeps absolute HTTPS links", () => {
		expect(resolveServiceAssetUrl("https://cdn.example/static/1.png", baseUrl)).toBe(
			"https://cdn.example/static/1.png"
		);
	});

	it("resolves service-relative links against the base URL", () => {
		expect(resolveServiceAssetUrl("static/47.png", baseUrl)).toBe(
			"https://api.test.profcomff.com/achievement/static/47.png"
		);
		expect(resolveServiceAssetUrl("/achievement/static/47.png", baseUrl)).toBe(
			"https://api.test.profcomff.com/achievement/static/47.png"
		);
	});

	it("tolerates a trailing slash in the base URL", () => {
		expect(resolveServiceAssetUrl("static/47.png", `${baseUrl}/`)).toBe(
			"https://api.test.profcomff.com/achievement/static/47.png"
		);
	});

	it.each([undefined, null, ""])("rejects missing link %s", link => {
		expect(resolveServiceAssetUrl(link, baseUrl)).toBeUndefined();
	});

	it.each(["javascript:alert(1)", "data:text/html,hi", "http://[invalid"])(
		"rejects unsafe or invalid link %s",
		link => {
			expect(resolveServiceAssetUrl(link, baseUrl)).toBeUndefined();
		}
	);

	it("rejects relative links without a base URL", () => {
		expect(resolveServiceAssetUrl("static/47.png", undefined)).toBeUndefined();
	});
});

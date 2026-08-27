import { describe, expect, it } from "vitest";

import { parseTimetableEntityId, resolveTimetablePhotoUrl } from "./timetable";

describe("parseTimetableEntityId", () => {
	it("parses positive integer identifiers", () => {
		expect(parseTimetableEntityId("42")).toBe(42);
	});

	it.each([null, "", "0", "-1", "1.5", "abc", "9007199254740992"])("rejects invalid identifier %s", value => {
		expect(parseTimetableEntityId(value)).toBeUndefined();
	});
});

describe("resolveTimetablePhotoUrl", () => {
	const baseUrl = "https://api.test.profcomff.com/timetable";

	it("keeps absolute HTTP(S) links", () => {
		expect(resolveTimetablePhotoUrl("https://cdn.example/photo.jpg", baseUrl)).toBe("https://cdn.example/photo.jpg");
	});

	it("resolves service-relative links", () => {
		expect(resolveTimetablePhotoUrl("static/photo/lecturer/photo.jpg", baseUrl)).toBe(
			"https://api.test.profcomff.com/timetable/static/photo/lecturer/photo.jpg"
		);
		expect(resolveTimetablePhotoUrl("/timetable/static/photo/lecturer/photo.jpg", baseUrl)).toBe(
			"https://api.test.profcomff.com/timetable/static/photo/lecturer/photo.jpg"
		);
	});

	it.each([undefined, null, "", "javascript:alert(1)", "http://[invalid"])(
		"rejects unsafe or missing link %s",
		link => {
			expect(resolveTimetablePhotoUrl(link, baseUrl)).toBeUndefined();
		}
	);
});

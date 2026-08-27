import { describe, expect, it } from "vitest";

import {
	parseTimetableDateParam,
	parseTimetableDaysParam,
	parseTimetableEntityId,
	resolveTimetablePhotoUrl,
} from "./timetable";

describe("parseTimetableDaysParam", () => {
	it.each(["1", "3", "7"])("accepts string span %s", value => {
		expect(parseTimetableDaysParam(value)).toBe(Number(value));
	});

	it.each([1, 3, 7])("accepts numeric span %s", value => {
		expect(parseTimetableDaysParam(value)).toBe(value);
	});

	it.each([null, undefined, "", "0", "2", "5", "10", "abc", "07", 0, 2, 5])("rejects invalid span %s", value => {
		expect(parseTimetableDaysParam(value)).toBeUndefined();
	});
});

describe("parseTimetableDateParam", () => {
	it("accepts a real calendar date", () => {
		expect(parseTimetableDateParam("2026-08-27")).toBe("2026-08-27");
	});

	it("accepts a leap day in a leap year", () => {
		expect(parseTimetableDateParam("2028-02-29")).toBe("2028-02-29");
	});

	it.each([null, undefined, "", "2026-13-45", "2026-02-30", "27.08.2026", "2026-2-7", "abc"])(
		"rejects invalid date %s",
		value => {
			expect(parseTimetableDateParam(value)).toBeUndefined();
		}
	);
});

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

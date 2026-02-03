import { describe, expect, it } from "vitest";

import { getEventsWithIntersections } from "./getEventsWithIntersections";

import type { EventGet } from "../api/timetable";

describe("getEventsWithIntersections", () => {
	it("должен корректно подсчитывать количество пересечений для непересекающихся событий", () => {
		const events: EventGet[] = [
			{
				end_ts: "2024-03-20T11:00:00",
				group: [],
				id: 1,
				lecturer: [],
				name: "Event 1",
				room: [],
				start_ts: "2024-03-20T10:00:00",
			},
			{
				end_ts: "2024-03-20T13:00:00",
				group: [],
				id: 2,
				lecturer: [],
				name: "Event 2",
				room: [],
				start_ts: "2024-03-20T12:00:00",
			},
		];

		const result = getEventsWithIntersections(events);
		expect(result.at(0)?.intersections).toBe(1); // событие пересекается только с самим собой
		expect(result.at(1)?.intersections).toBe(1);
	});

	it("должен корректно подсчитывать количество пересечений для частично пересекающихся событий", () => {
		const events: EventGet[] = [
			{
				end_ts: "2024-03-20T12:00:00",
				group: [],
				id: 1,
				lecturer: [],
				name: "Event 1",
				room: [],
				start_ts: "2024-03-20T10:00:00",
			},
			{
				end_ts: "2024-03-20T13:00:00",
				group: [],
				id: 2,
				lecturer: [],
				name: "Event 2",
				room: [],
				start_ts: "2024-03-20T11:00:00",
			},
		];

		const result = getEventsWithIntersections(events);
		expect(result.at(0)?.intersections).toBe(2); // пересекается с собой и вторым событием
		expect(result.at(1)?.intersections).toBe(2);
	});

	it("должен корректно подсчитывать количество пересечений для полностью перекрывающих друг друга событий", () => {
		const events: EventGet[] = [
			{
				end_ts: "2024-03-20T14:00:00",
				group: [],
				id: 1,
				lecturer: [],
				name: "Event 1",
				room: [],
				start_ts: "2024-03-20T10:00:00",
			},
			{
				end_ts: "2024-03-20T13:00:00",
				group: [],
				id: 2,
				lecturer: [],
				name: "Event 2",
				room: [],
				start_ts: "2024-03-20T11:00:00",
			},
		];

		const result = getEventsWithIntersections(events);
		expect(result.at(0)?.intersections).toBe(2);
		expect(result.at(1)?.intersections).toBe(2);
	});

	it("должен корректно обрабатывать пустой массив событий", () => {
		const events: EventGet[] = [];
		const result = getEventsWithIntersections(events);
		expect(result).toEqual([]);
	});

	it("должен сохранять все оригинальные поля события", () => {
		const events: EventGet[] = [
			{
				end_ts: "2024-03-20T11:00:00",
				group: [],
				id: 1,
				lecturer: [],
				name: "Test Event",
				room: [],
				start_ts: "2024-03-20T10:00:00",
			},
		];

		const result = getEventsWithIntersections(events);
		expect(result.at(0)).toEqual({
			...events.at(0),
			intersections: 1,
		});
	});
});

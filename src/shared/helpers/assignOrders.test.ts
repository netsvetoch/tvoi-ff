import { describe, expect, it } from "vitest";

import { assignOrders } from "./assignOrders";

describe("assignOrders", () => {
	it("должен назначать порядок 1 для одиночного события", () => {
		const events = [
			{
				end_ts: "2024-03-20T11:00:00Z",
				start_ts: "2024-03-20T10:00:00Z",
			},
		];

		const result = assignOrders(events);
		expect(result.at(0)?.order).toBe(1);
		// Проверяем, что исходный массив не изменился
		expect(events.at(0)).not.toHaveProperty("order");
	});

	it("должен назначать разные порядки для пересекающихся событий", () => {
		const events = [
			{
				end_ts: "2024-03-20T12:00:00Z",
				start_ts: "2024-03-20T10:00:00Z",
			},
			{
				end_ts: "2024-03-20T13:00:00Z",
				start_ts: "2024-03-20T11:00:00Z",
			},
		];

		const result = assignOrders(events);
		expect(result.at(0)?.order).toBe(1);
		expect(result.at(1)?.order).toBe(2);
		// Проверяем, что исходный массив не изменился
		expect(events.at(0)).not.toHaveProperty("order");
		expect(events.at(1)).not.toHaveProperty("order");
	});

	it("должен переиспользовать порядки для непересекающихся событий", () => {
		const events = [
			{
				end_ts: "2024-03-20T11:00:00Z",
				start_ts: "2024-03-20T10:00:00Z",
			},
			{
				end_ts: "2024-03-20T12:00:00Z",
				start_ts: "2024-03-20T11:00:00Z",
			},
		];

		const result = assignOrders(events);
		expect(result.at(0)?.order).toBe(1);
		expect(result.at(1)?.order).toBe(1);
	});

	it("должен корректно обрабатывать множественные пересечения", () => {
		const events = [
			{
				end_ts: "2024-03-20T13:00:00Z",
				start_ts: "2024-03-20T10:00:00Z",
			},
			{
				end_ts: "2024-03-20T14:00:00Z",
				start_ts: "2024-03-20T11:00:00Z",
			},
			{
				end_ts: "2024-03-20T15:00:00Z",
				start_ts: "2024-03-20T12:00:00Z",
			},
		];

		const result = assignOrders(events);
		expect(result.at(0)?.order).toBe(1);
		expect(result.at(1)?.order).toBe(2);
		expect(result.at(2)?.order).toBe(3);
	});

	it("должен корректно обрабатывать сложные пересечения с освобождением порядков", () => {
		const events = [
			{
				end_ts: "2024-03-20T12:00:00Z",
				start_ts: "2024-03-20T10:00:00Z",
			},
			{
				end_ts: "2024-03-20T13:00:00Z",
				start_ts: "2024-03-20T11:00:00Z",
			},
			{
				end_ts: "2024-03-20T14:00:00Z",
				start_ts: "2024-03-20T12:30:00Z",
			},
		];

		const result = assignOrders(events);
		expect(result.at(0)?.order).toBe(1);
		expect(result.at(1)?.order).toBe(2);
		expect(result.at(2)?.order).toBe(1); // переиспользует порядок 1, так как первое событие уже закончилось
	});

	it("должен сортировать события по времени начала", () => {
		const events = [
			{
				end_ts: "2024-03-20T12:00:00Z",
				start_ts: "2024-03-20T11:00:00Z",
			},
			{
				end_ts: "2024-03-20T11:00:00Z",
				start_ts: "2024-03-20T10:00:00Z",
			},
		];

		const result = assignOrders(events);
		expect(result.at(0)?.start_ts).toBe("2024-03-20T10:00:00Z");
		expect(result.at(1)?.start_ts).toBe("2024-03-20T11:00:00Z");
	});
});

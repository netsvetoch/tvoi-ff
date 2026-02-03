import { dateTime } from "@gravity-ui/date-utils";

import type { EventGet } from "../api/timetable";

export const assignOrders = <E extends Pick<EventGet, "end_ts" | "start_ts">>(
	events: E[]
): (E & { order: number })[] => {
	type EventWithOrder = E & { order: number };
	// Создаем копию массива и сортируем по времени начала
	const sortedEvents = [...events].sort((a, b) =>
		dateTime({ input: a.start_ts }).diff(dateTime({ input: b.start_ts }))
	);

	// Массив для отслеживания занятых порядковых номеров
	const usedOrders = new Set<number>();

	// Массив активных событий (те, которые еще не закончились)
	const activeEvents: EventWithOrder[] = [];

	// Результирующий массив
	const result: EventWithOrder[] = [];

	for (const event of sortedEvents) {
		const finishedEvent = activeEvents.at(0);
		// Удаляем завершившиеся события из активных и освобождаем их порядковые номера
		while (finishedEvent && dateTime({ input: finishedEvent.end_ts }).diff(dateTime({ input: event.start_ts })) <= 0) {
			activeEvents.shift();
			usedOrders.delete(finishedEvent.order);
		}

		// Находим минимальный свободный порядковый номер
		let order = 1;
		while (usedOrders.has(order)) {
			order++;
		}

		// Создаем новый объект события с порядковым номером
		const eventWithOrder: EventWithOrder = {
			...event,
			order,
		};

		// Добавляем событие в результат
		result.push(eventWithOrder);

		// Добавляем событие в активные и сортируем их по времени окончания
		activeEvents.push(eventWithOrder);
		activeEvents.sort((a, b) => dateTime({ input: a.end_ts }).diff(dateTime({ input: b.end_ts })));

		// Добавляем порядковый номер в множество занятых
		usedOrders.add(order);
	}

	return result;
};

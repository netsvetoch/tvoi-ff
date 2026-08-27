import { dateTime, type DateTime } from "@gravity-ui/date-utils";
import { NoSearchResults } from "@gravity-ui/illustrations";
import { Flex, Text } from "@gravity-ui/uikit";
import { useMediaQuery } from "@reactuses/core";
import { useQueries } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo } from "react";

import { getEventsEventGetOptions } from "@/shared/api/timetable/@tanstack/react-query.gen";
import { parseTimetableDateParam, parseTimetableDaysParam } from "@/shared/helpers";
import { Schedule } from "@/shared/ui";

interface TimetableScheduleProps {
	groupId?: number;
	lecturerId?: number;
	roomId?: number;
}

export const TimetableSchedule = ({ groupId, lecturerId, roomId }: TimetableScheduleProps) => {
	const isMobile = useMediaQuery("(max-width: 768px)");
	const search = useSearch({ strict: false });
	const navigate = useNavigate();

	const dateParam = parseTimetableDateParam(search.date);
	const currentDate = dateParam ? dateTime({ input: dateParam }) : dateTime();
	const showedWeekdays = parseTimetableDaysParam(search.days) ?? (isMobile ? 3 : 7);

	const onDateUpdate = (date: DateTime) => {
		navigate({
			search: prev => ({ ...prev, date: date.format("YYYY-MM-DD") }),
			to: ".",
		});
	};

	const onShowedWeekdaysUpdate = (weekdays: 1 | 3 | 7) => {
		navigate({
			search: prev => ({ ...prev, days: weekdays }),
			to: ".",
		});
	};

	const period = useMemo(() => {
		switch (showedWeekdays) {
			case 1: {
				return { end: currentDate.add(1, "day"), start: currentDate };
			}
			case 3: {
				return { end: currentDate.add(2, "day"), start: currentDate.subtract(1, "day") };
			}
			case 7: {
				return { end: currentDate.set({ weekday: 6 }), start: currentDate.set({ weekday: 0 }) };
			}
		}
	}, [currentDate, showedWeekdays]);

	const filters = [
		groupId ? { group_id: groupId } : undefined,
		lecturerId ? { lecturer_id: lecturerId } : undefined,
		roomId ? { room_id: roomId } : undefined,
	].filter(filter => filter !== undefined);
	const eventQueries = useQueries({
		queries: filters.map(filter =>
			getEventsEventGetOptions({
				query: {
					...filter,
					end: period.end.format("YYYY-MM-DD"),
					start: period.start.format("YYYY-MM-DD"),
				},
			})
		),
	});
	const firstEvents = eventQueries[0]?.data?.items ?? [];
	const events = firstEvents.filter(event =>
		eventQueries.slice(1).every(query => query.data?.items.some(candidate => candidate.id === event.id))
	);
	const isLoading = eventQueries.some(query => query.isLoading);
	const hasError = eventQueries.some(query => query.isError);
	const emptyFilterOverlay = (
		<Flex alignItems="center" direction="column" gap={2}>
			<NoSearchResults />
			<Text variant="subheader-1">Выберите группу, кабинет или преподавателя</Text>
		</Flex>
	);
	const overlay = filters.length === 0 ? emptyFilterOverlay : undefined;
	const scheduleOverlay = hasError ? <NoSearchResults /> : overlay;

	return (
		<Schedule
			date={currentDate}
			events={events}
			isLoading={isLoading}
			onDateUpdate={onDateUpdate}
			onShowedWeekdaysUpdate={onShowedWeekdaysUpdate}
			overlay={scheduleOverlay}
			period={period}
			showedWeekdays={showedWeekdays}
		/>
	);
};

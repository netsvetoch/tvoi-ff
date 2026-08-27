import { dateTime } from "@gravity-ui/date-utils";
import { NoSearchResults } from "@gravity-ui/illustrations";
import { useMediaQuery } from "@reactuses/core";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { getEventsEventGetOptions } from "@/shared/api/timetable/@tanstack/react-query.gen";
import { Schedule } from "@/shared/ui";

interface TimetableScheduleProps {
	groupId?: number;
	lecturerId?: number;
	roomId?: number;
}

export const TimetableSchedule = ({ groupId, lecturerId, roomId }: TimetableScheduleProps) => {
	const isMobile = useMediaQuery("(max-width: 768px)");

	const [currentDate, setCurrentDate] = useState(dateTime());
	const [showedWeekdays, setShowedWeekdays] = useState<1 | 3 | 7>(isMobile ? 3 : 7);

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

	const { data, error, isLoading } = useQuery(
		getEventsEventGetOptions({
			query: {
				end: period.end.format("YYYY-MM-DD"),
				group_id: groupId,
				lecturer_id: lecturerId,
				room_id: roomId,
				start: period.start.format("YYYY-MM-DD"),
			},
		})
	);

	const events = data?.items ?? [];

	return (
		<Schedule
			date={currentDate}
			events={events}
			isLoading={isLoading}
			onDateUpdate={setCurrentDate}
			onShowedWeekdaysUpdate={setShowedWeekdays}
			overlay={error ? <NoSearchResults /> : undefined}
			period={period}
			showedWeekdays={showedWeekdays}
		/>
	);
};

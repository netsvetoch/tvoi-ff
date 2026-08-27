import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

import { getRoomByIdRoomIdGetOptions } from "@/shared/api/timetable/@tanstack/react-query.gen";
import { Container, PageHeader } from "@/shared/ui";
import { TimetableSchedule } from "@/widgets/timetable";

export const TimetableRoomPage = () => {
	const { id } = useParams({ from: "/timetable/rooms/$id" });

	const roomId = Number(id);

	const { data: room, isLoading: isRoomLoading } = useQuery(getRoomByIdRoomIdGetOptions({ path: { id: roomId } }));

	return (
		<>
			<PageHeader
				breadcrumbs={[
					{ href: "/timetable", label: "Расписание" },
					{ href: "/timetable/rooms", label: "Кабинеты" },
					{
						href: `/timetable/rooms/${roomId}`,
						label: room?.name ?? "",
						loading: isRoomLoading,
					},
				]}
			/>
			<Container>
				<TimetableSchedule roomId={roomId} />
			</Container>
		</>
	);
};

import { dateTime } from "@gravity-ui/date-utils";
import { Flex, Link, spacing, Text } from "@gravity-ui/uikit";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";

import { getEventByIdEventIdGetOptions } from "@/shared/api/timetable/@tanstack/react-query.gen";
import { getLecturerShortName } from "@/shared/helpers";
import { Container, PageHeader } from "@/shared/ui";

export const TimetableEventPage = () => {
	const params = useParams();
	const eventId = Number(params.eventId);

	const { data: event, isLoading: isEventLoading } = useQuery(getEventByIdEventIdGetOptions({ path: { id: eventId } }));

	const navigate = useNavigate();

	return (
		<Flex direction="column">
			<PageHeader
				breadcrumbs={[
					{ href: "/timetable", label: "Расписание" },
					{ href: "/timetable/events", label: "События" },
					{
						href: `/timetable/events/${eventId}`,
						label: `${event?.name} ${dateTime({ input: event?.start_ts }).format("D MMMM")}`,
						loading: isEventLoading,
					},
				]}
			/>
			<Container>
				<Text className={spacing({ mb: 1 })} variant="header-1">
					{event?.name}
				</Text>
				<Text className={spacing({ mb: 4 })} color="secondary" variant="subheader-1">
					{event?.lecturer.map(l => (
						<Link
							href={`/timetable/lecturers/${l.id}`}
							key={l.id}
							onClick={e => {
								e.preventDefault();
								void navigate(`/timetable/lecturers/${l.id}`);
							}}
						>
							{getLecturerShortName(l)}
						</Link>
					))}
				</Text>
				<Text className={spacing({ mb: 4 })} color="secondary" variant="subheader-1">
					{event?.room.map(r => (
						<Link
							href={`/timetable/rooms/${r.id}`}
							key={r.id}
							onClick={e => {
								e.preventDefault();
								void navigate(`/timetable/rooms/${r.id}`);
							}}
						>
							{r.name}
						</Link>
					))}
				</Text>
			</Container>
		</Flex>
	);
};

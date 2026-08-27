import type { ReactNode } from "react";

import { dateTime } from "@gravity-ui/date-utils";
import { Button, Flex, Link, Skeleton, spacing, Text } from "@gravity-ui/uikit";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";

import { getEventByIdEventIdGetOptions } from "@/shared/api/timetable/@tanstack/react-query.gen";
import { getLecturerShortName, parseTimetableEntityId } from "@/shared/helpers";
import { Container, PageHeader } from "@/shared/ui";

import { EventComments } from "./EventComments";
import { EventVisitStatus } from "./EventVisitStatus";

interface RelationLinkItem {
	id: number;
}

const RelationLinks = <TItem extends RelationLinkItem>({
	getLabel,
	items,
	path,
}: {
	getLabel: (item: TItem) => ReactNode;
	items: TItem[];
	path: "/timetable/groups" | "/timetable/lecturers" | "/timetable/rooms";
}) => {
	const navigate = useNavigate();

	if (items.length === 0) {
		return <Text color="secondary">Не указано</Text>;
	}

	return items.map((item, index) => (
		<span key={item.id}>
			{index > 0 && ", "}
			<Link
				href={`${path}/${item.id}`}
				onClick={event => {
					event.preventDefault();
					navigate({ params: { id: String(item.id) }, to: `${path}/$id` });
				}}
			>
				{getLabel(item)}
			</Link>
		</span>
	));
};

export const TimetableEventPage = () => {
	const { id } = useParams({ from: "/timetable/events/$id" });
	const eventId = parseTimetableEntityId(id);

	const eventQuery = useQuery({
		...getEventByIdEventIdGetOptions({ path: { id: eventId ?? 0 } }),
		enabled: Boolean(eventId),
	});
	const { data: event, isError, isLoading: isEventLoading, refetch } = eventQuery;
	const eventDate = event ? dateTime({ input: event.start_ts }).format("D MMMM YYYY, HH:mm") : "";

	return (
		<Flex direction="column">
			<PageHeader
				breadcrumbs={[
					{ href: "/timetable", label: "Расписание" },
					{ href: "/timetable/events", label: "События" },
					{
						href: `/timetable/events/${eventId ?? ""}`,
						label: event ? `${event.name} ${dateTime({ input: event.start_ts }).format("D MMMM")}` : "Событие",
						loading: isEventLoading,
					},
				]}
			/>
			<Container>
				{isEventLoading && (
					<Flex direction="column" gap={3}>
						<Skeleton style={{ height: 32, width: "60%" }} />
						<Skeleton style={{ height: 20, width: "40%" }} />
					</Flex>
				)}
				{!isEventLoading &&
					(!eventId || isError || !event ? (
						<Flex alignItems="flex-start" direction="column" gap={2}>
							<Text variant="header-2">Событие не найдено</Text>
							<Text color="secondary">Проверьте ссылку или попробуйте загрузить данные ещё раз.</Text>
							{eventId && <Button onClick={() => void refetch()}>Повторить</Button>}
						</Flex>
					) : (
						<Flex direction="column" gap={3}>
							<Text variant="header-1">{event.name}</Text>
							<Text color="secondary" variant="subheader-1">
								{eventDate} — {dateTime({ input: event.end_ts }).format("D MMMM YYYY, HH:mm")}
							</Text>
							<Flex direction="column" gap={1}>
								<Text color="secondary">Группы</Text>
								<Text className={spacing({ mb: 1 })}>
									<RelationLinks getLabel={group => group.number} items={event.group} path="/timetable/groups" />
								</Text>
								<Text color="secondary">Преподаватели</Text>
								<Text className={spacing({ mb: 1 })}>
									<RelationLinks
										getLabel={lecturer => getLecturerShortName(lecturer)}
										items={event.lecturer}
										path="/timetable/lecturers"
									/>
								</Text>
								<Text color="secondary">Кабинеты</Text>
								<Text>
									<RelationLinks getLabel={room => room.name} items={event.room} path="/timetable/rooms" />
								</Text>
							</Flex>
							<EventVisitStatus eventId={event.id} />
							<EventComments eventId={event.id} />
						</Flex>
					))}
			</Container>
		</Flex>
	);
};

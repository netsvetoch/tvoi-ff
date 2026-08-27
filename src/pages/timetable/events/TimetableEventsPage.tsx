import { Flex, Select, Skeleton, spacing } from "@gravity-ui/uikit";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";

import {
	getGroupsGroupGetOptions,
	getLecturersLecturerGetOptions,
	getRoomsRoomGetOptions,
} from "@/shared/api/timetable/@tanstack/react-query.gen";
import { getLecturerShortName, parseTimetableEntityId } from "@/shared/helpers";
import { Container, PageHeader } from "@/shared/ui";
import { TimetableSchedule } from "@/widgets/timetable";

import styles from "./TimetableEventsPage.module.css";

export const TimetableEventsPage = () => {
	const {
		groupId: groupParam,
		lecturerId: lecturerParam,
		roomId: roomParam,
	} = useSearch({
		from: "/timetable/events/",
	});
	const navigate = useNavigate();

	const roomId = parseTimetableEntityId(roomParam);
	const groupId = parseTimetableEntityId(groupParam);
	const lecturerId = parseTimetableEntityId(lecturerParam);

	const setFilter = (key: "groupId" | "lecturerId" | "roomId", value?: string) => {
		navigate({
			search: prev => {
				const next = { ...prev };

				if (value) {
					next[key] = value;
				} else {
					next[key] = undefined;
				}

				return next;
			},
			to: "/timetable/events",
		});
	};

	const { data: roomsData, isLoading: isRoomsLoading } = useQuery(getRoomsRoomGetOptions({ query: { limit: 10_000 } }));
	const { data: groupsData, isLoading: isGroupsLoading } = useQuery(
		getGroupsGroupGetOptions({ query: { limit: 10_000 } })
	);
	const { data: lecturersData, isLoading: isLecturersLoading } = useQuery(
		getLecturersLecturerGetOptions({ query: { limit: 10_000 } })
	);

	const rooms = roomsData?.items ?? [];
	const groups = groupsData?.items.filter(group => Boolean(group.number)) ?? [];
	const lecturers = lecturersData?.items ?? [];

	const isLoading = isRoomsLoading || isGroupsLoading || isLecturersLoading;

	return (
		<>
			<PageHeader
				breadcrumbs={[
					{ href: "/timetable", label: "Расписание" },
					{ href: "/timetable/events", label: "События" },
				]}
			/>
			<Container>
				<Flex className={`${styles.filters} ${spacing({ mb: 3 })}`} gap={3}>
					{isLoading ? (
						<>
							<Skeleton style={{ flex: 1, height: 28 }} />
							<Skeleton style={{ flex: 1, height: 28 }} />
							<Skeleton style={{ flex: 1, height: 28 }} />
						</>
					) : (
						<>
							<Select
								className={styles.filter}
								filterable
								filterPlaceholder="Поиск"
								hasClear
								label="Кабинет"
								onUpdate={([value]) => setFilter("roomId", value)}
								options={rooms.map(room => ({
									content: room.name,
									value: room.id.toString(),
								}))}
								placeholder="Выберите"
								value={roomId ? [roomId.toString()] : []}
								width="max"
							/>
							<Select
								className={styles.filter}
								filterable
								filterPlaceholder="Поиск"
								hasClear
								label="Группа"
								onUpdate={([value]) => setFilter("groupId", value)}
								options={groups.map(group => ({
									content: group.number,
									value: group.id.toString(),
								}))}
								placeholder="Выберите"
								value={groupId ? [groupId.toString()] : []}
								width="max"
							/>
							<Select
								className={styles.filter}
								filterable
								filterPlaceholder="Поиск"
								hasClear
								label="Преподаватель"
								onUpdate={([value]) => setFilter("lecturerId", value)}
								options={lecturers.map(lecturer => ({
									content: getLecturerShortName(lecturer),
									value: lecturer.id.toString(),
								}))}
								placeholder="Выберите"
								value={lecturerId ? [lecturerId.toString()] : []}
								width="max"
							/>
						</>
					)}
				</Flex>
				<TimetableSchedule groupId={groupId} lecturerId={lecturerId} roomId={roomId} />
			</Container>
		</>
	);
};

import { Flex, Select, Skeleton, spacing } from "@gravity-ui/uikit";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

import {
	getGroupsGroupGetOptions,
	getLecturersLecturerGetOptions,
	getRoomsRoomGetOptions,
} from "@/shared/api/timetable/@tanstack/react-query.gen";
import { getLecturerShortName } from "@/shared/helpers";
import { Container, PageHeader } from "@/shared/ui";
import { TimetableSchedule } from "@/widgets/timetable";

export const TimetableEventsPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();

	const roomId = searchParams.get("roomId");
	const groupId = searchParams.get("groupId");
	const lecturerId = searchParams.get("lecturerId");

	const { data: roomsData, isLoading: isRoomsLoading } = useQuery(getRoomsRoomGetOptions({ query: { limit: 10e5 } }));
	const { data: groupsData, isLoading: isGroupsLoading } = useQuery(
		getGroupsGroupGetOptions({ query: { limit: 10e5 } })
	);
	const { data: lecturersData, isLoading: isLecturersLoading } = useQuery(
		getLecturersLecturerGetOptions({ query: { limit: 10e5 } })
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
				<Flex className={spacing({ mb: 3 })} gap={3}>
					{isLoading ? (
						<>
							<Skeleton style={{ flex: 1, height: 28 }} />
							<Skeleton style={{ flex: 1, height: 28 }} />
							<Skeleton style={{ flex: 1, height: 28 }} />
						</>
					) : (
						<>
							<Select
								filterable
								filterPlaceholder="Поиск"
								hasClear
								label="Кабинет"
								onUpdate={([value]) => {
									setSearchParams({ roomId: value });
								}}
								options={rooms.map(room => ({
									content: room.name,
									value: room.id.toString(),
								}))}
								placeholder="Выберите"
								width="max"
							/>
							<Select
								filterable
								filterPlaceholder="Поиск"
								hasClear
								label="Группа"
								onUpdate={([value]) => {
									setSearchParams({ groupId: value });
								}}
								options={groups.map(group => ({
									content: group.number,
									value: group.id.toString(),
								}))}
								placeholder="Выберите"
								width="max"
							/>
							<Select
								filterable
								filterPlaceholder="Поиск"
								hasClear
								label="Преподаватель"
								onUpdate={([value]) => {
									setSearchParams({ lecturerId: value });
								}}
								options={lecturers.map(lecturer => ({
									content: getLecturerShortName(lecturer),
									value: lecturer.id.toString(),
								}))}
								placeholder="Выберите"
								width="max"
							/>
						</>
					)}
				</Flex>
				<TimetableSchedule
					groupId={groupId ? Number(groupId) : undefined}
					lecturerId={lecturerId ? Number(lecturerId) : undefined}
					roomId={roomId ? Number(roomId) : undefined}
				/>
			</Container>
		</>
	);
};

import type { ColumnDef } from "@tanstack/react-table";

import { Flex, Loader, TextInput } from "@gravity-ui/uikit";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { tableFeatures, useTable } from "@tanstack/react-table";
import { useDeferredValue, useState } from "react";

import type { RoomGet } from "@/shared/api/timetable";

import { getRoomsRoomGetOptions } from "@/shared/api/timetable/@tanstack/react-query.gen";
import { Container, GTable, PageHeader } from "@/shared/ui";

import styles from "../TimetableCatalogs.module.css";

const features = tableFeatures({});

const columns: ColumnDef<typeof features, RoomGet>[] = [
	{ accessorKey: "name", header: "Кабинет" },
	{
		accessorKey: "building",
		cell: ({ getValue }) => getValue<null | string>() || "Не указано",
		header: "Корпус",
	},
];

const EMPTY_ROOMS: RoomGet[] = [];

export const TimetableRoomsPage = () => {
	const navigate = useNavigate();
	const [search, setSearch] = useState("");
	const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase("ru"));
	const { data, isLoading } = useQuery(getRoomsRoomGetOptions({ query: { limit: 10_000 } }));
	const rooms = data?.items ?? EMPTY_ROOMS;
	const filteredRooms = deferredSearch
		? rooms.filter(room => `${room.name} ${room.building ?? ""}`.toLocaleLowerCase("ru").includes(deferredSearch))
		: rooms;
	const table = useTable({ columns, data: filteredRooms, features });

	return (
		<>
			<PageHeader
				breadcrumbs={[
					{ href: "/timetable", label: "Расписание" },
					{ href: "/timetable/rooms", label: "Кабинеты" },
				]}
			/>
			<Container>
				<Flex direction="column" gap={3}>
					<TextInput
						className={styles.search}
						controlProps={{ "aria-label": "Поиск кабинета" }}
						hasClear
						onUpdate={setSearch}
						placeholder="Название кабинета или корпуса"
						type="search"
						value={search}
					/>
					{isLoading ? (
						<Flex alignItems="center" className={styles.loading} justifyContent="center">
							<Loader size="l" />
						</Flex>
					) : (
						<GTable
							emptyMessage="Кабинеты не найдены"
							onRowClick={row => navigate({ params: { id: String(row.original.id) }, to: "/timetable/rooms/$id" })}
							table={table}
						/>
					)}
				</Flex>
			</Container>
		</>
	);
};

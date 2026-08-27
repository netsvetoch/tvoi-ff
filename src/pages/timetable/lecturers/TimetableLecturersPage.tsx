import type { ColumnDef } from "@tanstack/react-table";

import { Flex, Loader, TextInput } from "@gravity-ui/uikit";
import { useQuery } from "@tanstack/react-query";
import { tableFeatures, useTable } from "@tanstack/react-table";
import { useDeferredValue, useState } from "react";
import { useNavigate } from "react-router";

import type { LecturerGet } from "@/shared/api/timetable";

import { getLecturersLecturerGetOptions } from "@/shared/api/timetable/@tanstack/react-query.gen";
import { Container, GTable, PageHeader } from "@/shared/ui";

import styles from "../TimetableCatalogs.module.css";

const features = tableFeatures({});

const columns: ColumnDef<typeof features, LecturerGet>[] = [
	{ accessorKey: "last_name", header: "Фамилия" },
	{ accessorKey: "first_name", header: "Имя" },
	{ accessorKey: "middle_name", header: "Отчество" },
];

const EMPTY_LECTURERS: LecturerGet[] = [];

export const TimetableLecturersPage = () => {
	const navigate = useNavigate();
	const [search, setSearch] = useState("");
	const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase("ru"));
	const { data, isLoading } = useQuery(getLecturersLecturerGetOptions({ query: { limit: 10_000 } }));
	const lecturers = data?.items ?? EMPTY_LECTURERS;
	const filteredLecturers = deferredSearch
		? lecturers.filter(lecturer =>
				`${lecturer.last_name} ${lecturer.first_name} ${lecturer.middle_name}`
					.toLocaleLowerCase("ru")
					.includes(deferredSearch)
			)
		: lecturers;
	const table = useTable({ columns, data: filteredLecturers, features });

	return (
		<>
			<PageHeader
				breadcrumbs={[
					{ href: "/timetable", label: "Расписание" },
					{ href: "/timetable/lecturers", label: "Преподаватели" },
				]}
			/>
			<Container>
				<Flex direction="column" gap={3}>
					<TextInput
						className={styles.search}
						controlProps={{ "aria-label": "Поиск преподавателя" }}
						hasClear
						onUpdate={setSearch}
						placeholder="Фамилия, имя или отчество"
						type="search"
						value={search}
					/>
					{isLoading ? (
						<Flex alignItems="center" className={styles.loading} justifyContent="center">
							<Loader size="l" />
						</Flex>
					) : (
						<GTable
							emptyMessage="Преподаватели не найдены"
							onRowClick={row => navigate(`/timetable/lecturers/${row.original.id}`)}
							table={table}
						/>
					)}
				</Flex>
			</Container>
		</>
	);
};

import { Table, useTable } from "@gravity-ui/table";
import { Flex, Label, Loader, Pagination, Select, Text, TextInput } from "@gravity-ui/uikit";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { getLecturersLecturerGetOptions } from "@/shared/api/rating/@tanstack/react-query.gen";
import { formatNumber } from "@/shared/helpers";
import { getLabelNumberColor } from "@/shared/helpers/getLabelNumberColor";

import styles from "./LecturersTable.module.css";

import type { LecturerGet } from "@/shared/api/rating";
import type { ColumnDef, SortingState } from "@gravity-ui/table/tanstack";

const SUBJECTS = [
	"Атомный практикум",
	"Астрометрия",
	"Атомная физика",
	"Английский язык",
	"Астрофизика",
	"Теория вероятностей",
	"Введение в квантовую физику",
	"Введение в численные методы и математическое моделирование в физике",
	"Математический анализ",
	"Математическая обработка наблюдений",
	"Аналитическая геометрия",
];

const subjectsSelectOptions = SUBJECTS.map(subject => ({
	content: subject,
	value: subject,
}));

const columns: ColumnDef<LecturerGet>[] = [
	{
		accessorKey: "last_name",
		header: "Фамилия",
	},
	{
		accessorKey: "first_name",
		header: "Имя",
	},
	{
		accessorKey: "middle_name",
		header: "Отчество",
	},
	{
		accessorKey: "mark_weighted",
		cell: ({ row }) => {
			const mark = row.original.mark_weighted;

			if (mark) {
				return <Label theme={getLabelNumberColor(mark)}>{formatNumber(mark)}</Label>;
			}

			return <Text color="secondary">Нет оценки</Text>;
		},
		header: "Оценка",
		minSize: 80,
	},
	{
		accessorKey: "subjects",
		cell: ({ row }) => {
			return (
				<Flex gap={1}>
					{row.original.subjects?.filter(Boolean).map(subject => (
						<Label key={subject}>{subject}</Label>
					))}
				</Flex>
			);
		},
		enableSorting: false,
		header: "Предметы",
	},
];

export const LecturersTable = () => {
	const navigate = useNavigate();

	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(20);
	const [sorting, setSorting] = useState<SortingState>([{ desc: true, id: "mark_weighted" }]);
	const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
	const [search, setSearch] = useState("");

	const { data, isLoading } = useQuery(
		getLecturersLecturerGetOptions({
			query: {
				limit: pageSize,
				name: search,
				offset: (page - 1) * pageSize,
				order_by: sorting.at(0)?.id,
				subject: selectedSubjects.at(0),
			},
		})
	);

	const lecturers = useMemo(() => {
		return data?.lecturers ?? [];
	}, [data]);

	const table = useTable({
		columns,
		data: lecturers,
		enableSorting: true,
		manualSorting: true,
		onSortingChange: setSorting,
		state: { sorting },
	});

	return (
		<Flex direction="column" gap={3}>
			<Flex gap={3}>
				<TextInput
					onUpdate={value => {
						setPage(1);
						setSearch(value);
					}}
					placeholder="Поиск преподавателя"
					style={{ maxWidth: 500 }}
					value={search}
				/>
				<Select
					className={styles.select}
					hasClear
					label="Предмет"
					onUpdate={value => {
						setSelectedSubjects(value);
						setPage(1);
					}}
					options={subjectsSelectOptions}
					value={selectedSubjects}
				/>
			</Flex>
			{isLoading ? (
				<Flex alignItems="center" justifyContent="center" style={{ height: (pageSize + 1) * 32 + pageSize * 2 }}>
					<Loader size="l" />
				</Flex>
			) : (
				<div style={{ overflowX: "auto" }}>
					<Table
						onRowClick={row => {
							void navigate(`/rating/lecturer/${row.original.id}`);
						}}
						size="s"
						table={table}
					/>
				</div>
			)}
			<Pagination
				onUpdate={(p, ps) => {
					if (ps === pageSize) {
						setPage(p);
					} else {
						setPage(1);
						setPageSize(ps);
					}
				}}
				page={page}
				pageSize={pageSize}
				pageSizeOptions={[10, 20, 50, 100]}
				showInput
				showPages
				total={data?.total ?? 0}
			/>
		</Flex>
	);
};

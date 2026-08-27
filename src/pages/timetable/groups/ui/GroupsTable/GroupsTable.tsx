import type { ColumnDef } from "@tanstack/react-table";

import { Star, StarFill } from "@gravity-ui/icons";
import { Button, Icon } from "@gravity-ui/uikit";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { tableFeatures, useTable } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";

import type { GroupGet } from "@/shared/api/timetable";

import { getGroupsGroupGetOptions } from "@/shared/api/timetable/@tanstack/react-query.gen";
import { useFavoriteGroups } from "@/shared/hooks";
import { GTable } from "@/shared/ui";

import styles from "./GroupsTable.module.css";

const features = tableFeatures({});

const staticColumns: ColumnDef<typeof features, GroupGet>[] = [
	{
		accessorKey: "id",
		header: "id",
	},
	{
		accessorKey: "number",
		header: "Номер",
	},
	{
		accessorKey: "name",
		cell: ({ getValue }) => {
			return getValue<string>().replace("каф.", "Кафедра ");
		},
		header: "Название",
	},
];

interface GroupsTableProps {
	search: string;
}

export const GroupsTable = ({ search }: GroupsTableProps) => {
	const navigate = useNavigate();

	const { data: groups = [] } = useQuery({
		...getGroupsGroupGetOptions({ query: { limit: Number.MAX_SAFE_INTEGER } }),
		select: data => data.items,
	});

	const { addFavoriteGroup, favoriteGroups, removeFavoriteGroup } = useFavoriteGroups();

	const onFavoriteClick = useCallback(
		(groupId: number) => {
			if (favoriteGroups.has(groupId)) {
				removeFavoriteGroup(groupId);
			} else {
				addFavoriteGroup(groupId);
			}
		},
		[favoriteGroups, addFavoriteGroup, removeFavoriteGroup]
	);

	const columns = useMemo(() => {
		return [
			...staticColumns,
			{
				cell: ({ row }) => (
					<Button
						onClick={e => {
							e.stopPropagation();
							e.preventDefault();
							onFavoriteClick(row.getValue<number>("id"));
						}}
						size="xs"
						view="flat"
					>
						<Icon data={favoriteGroups.has(row.getValue<number>("id")) ? StarFill : Star} />
					</Button>
				),
				header: "",
				id: "favorite",
			},
		];
	}, [onFavoriteClick, favoriteGroups]) satisfies ColumnDef<typeof features, GroupGet>[];

	const sortedData = useMemo(
		() =>
			groups
				.filter(n => !Number.isNaN(Number.parseInt(n.number)))
				.filter(
					({ name, number }) =>
						number.toLowerCase().includes(search.toLowerCase()) || name?.toLowerCase().includes(search.toLowerCase())
				)
				.toSorted((a, b) => {
					if (a.number.includes("м") && !b.number.includes("м")) return 1;
					if (!a.number.includes("м") && b.number.includes("м")) return -1;
					return Number.parseInt(a.number) - Number.parseInt(b.number);
				})
				.toSorted((a, b) => {
					if (favoriteGroups.has(a.id) && !favoriteGroups.has(b.id)) return -1;
					if (!favoriteGroups.has(a.id) && favoriteGroups.has(b.id)) return 1;
					return 0;
				}),
		[groups, favoriteGroups, search]
	);

	const table = useTable({
		columns,
		data: sortedData,
		features,
	});

	return (
		<GTable
			className={styles.table}
			emptyMessage="Группы не найдены"
			key={favoriteGroups.size}
			onRowClick={row => {
				navigate({ params: { id: String(row.getValue<number>("id")) }, to: "/timetable/groups/$id" });
			}}
			table={table}
		/>
	);
};

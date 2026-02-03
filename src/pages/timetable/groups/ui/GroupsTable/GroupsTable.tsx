import { Star, StarFill } from "@gravity-ui/icons";
import { Table, useTable } from "@gravity-ui/table";
import { Button, Icon } from "@gravity-ui/uikit";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";

import { getGroupsGroupGetOptions } from "@/shared/api/timetable/@tanstack/react-query.gen";
import { useFavoriteGroups } from "@/shared/hooks";

import styles from "./GroupsTable.module.css";

import type { GroupGet } from "@/shared/api/timetable";
import type { ColumnDef } from "@gravity-ui/table/tanstack";

const staticColumns: ColumnDef<GroupGet>[] = [
	{
		accessorKey: "id",
		header: "id",
		maxSize: 80,
	},
	{
		accessorKey: "number",
		header: "Номер",
		maxSize: 80,
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
				// eslint-disable-next-line react/no-unstable-nested-components
				cell: ({ row }) => (
					<Button
						onClick={e => {
							e.stopPropagation();
							e.preventDefault();
							onFavoriteClick(row.getValue("id"));
						}}
						size="xs"
						view="flat"
					>
						<Icon data={favoriteGroups.has(row.getValue("id")) ? StarFill : Star} />
					</Button>
				),
				header: "",
				id: "favorite",
			},
		];
	}, [onFavoriteClick, favoriteGroups]);

	const sortedData = useMemo(
		() =>
			[...groups]
				.filter(n => !Number.isNaN(Number.parseInt(n.number)))
				.filter(
					({ name, number }) =>
						number.toLowerCase().includes(search.toLowerCase()) || name?.toLowerCase().includes(search.toLowerCase())
				)
				.sort((a, b) => {
					if (a.number.includes("м") && !b.number.includes("м")) return 1;
					if (!a.number.includes("м") && b.number.includes("м")) return -1;
					return Number.parseInt(a.number) - Number.parseInt(b.number);
				})
				.sort((a, b) => {
					if (favoriteGroups.has(a.id) && !favoriteGroups.has(b.id)) return -1;
					if (!favoriteGroups.has(a.id) && favoriteGroups.has(b.id)) return 1;
					return 0;
				}),
		[groups, favoriteGroups, search]
	);

	const table = useTable({
		columns,
		data: sortedData,
	});

	return (
		<Table
			className={styles.table}
			key={favoriteGroups.size}
			onRowClick={({ getValue }) => {
				void navigate(`/timetable/groups/${getValue<number>("id")}`);
			}}
			size="s"
			table={table}
		/>
	);
};

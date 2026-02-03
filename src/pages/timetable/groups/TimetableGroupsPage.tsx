import { Flex, TextInput } from "@gravity-ui/uikit";
import { useState } from "react";

import { Container, PageHeader } from "@/shared/ui";

import { GroupsTable } from "./ui";

export const TimetableGroupsPage = () => {
	const [search, setSearch] = useState("");

	return (
		<>
			<PageHeader
				breadcrumbs={[
					{ href: "/timetable", label: "Расписание" },
					{ href: "/timetable/groups", label: "Группы" },
				]}
			/>
			<Container>
				<Flex direction="column" gap={3}>
					<TextInput onUpdate={setSearch} placeholder="Поиск группы" value={search} />
					<GroupsTable search={search} />
				</Flex>
			</Container>
		</>
	);
};

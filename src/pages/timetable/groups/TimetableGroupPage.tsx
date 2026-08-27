import { Flex, spacing, Text } from "@gravity-ui/uikit";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

import { getGroupByIdGroupIdGetOptions } from "@/shared/api/timetable/@tanstack/react-query.gen";
import { Container, PageHeader } from "@/shared/ui";
import { TimetableSchedule } from "@/widgets/timetable";
export const TimetableGroupPage = () => {
	const { id } = useParams({ from: "/timetable/groups/$id" });
	const groupId = Number(id);

	const { data: group, isLoading: isGroupLoading } = useQuery(getGroupByIdGroupIdGetOptions({ path: { id: groupId } }));

	return (
		<Flex direction="column">
			<PageHeader
				breadcrumbs={[
					{ href: "/timetable", label: "Расписание" },
					{ href: "/timetable/groups", label: "Группы" },
					{
						href: `/timetable/groups/${groupId}`,
						label: `Группа №${group?.number}`,
						loading: isGroupLoading,
					},
				]}
			/>
			<Container>
				<Text className={spacing({ mb: 1 })} variant="header-1">
					Группа №{group?.number}
				</Text>
				<Text className={spacing({ mb: 4 })} color="secondary" variant="subheader-1">
					{group?.name?.replace("каф.", "Кафедра ")}
				</Text>
				<TimetableSchedule groupId={groupId} />
			</Container>
		</Flex>
	);
};

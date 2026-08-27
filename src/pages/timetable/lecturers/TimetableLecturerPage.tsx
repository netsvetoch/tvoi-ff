import { Button, Flex, Text } from "@gravity-ui/uikit";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";

import { getLecturerByIdLecturerIdGetOptions } from "@/shared/api/timetable/@tanstack/react-query.gen";
import { getLecturerShortName, parseTimetableEntityId } from "@/shared/helpers";
import { Container, PageHeader } from "@/shared/ui";
import { LecturerPhotos, TimetableSchedule } from "@/widgets/timetable";

export const TimetableLecturerPage = () => {
	const params = useParams();
	const lecturerId = parseTimetableEntityId(params.lecturerId ?? null);

	const lecturerQuery = useQuery({
		...getLecturerByIdLecturerIdGetOptions({ path: { id: lecturerId ?? 0 } }),
		enabled: Boolean(lecturerId),
	});
	const { data: lecturer, isError, isLoading: isLecturerLoading, refetch } = lecturerQuery;
	const lecturerName = lecturer ? getLecturerShortName(lecturer) : "";
	const hasError = !lecturerId || isError || (!isLecturerLoading && !lecturer);

	return (
		<>
			<PageHeader
				breadcrumbs={[
					{ href: "/timetable", label: "Расписание" },
					{ href: "/timetable/lecturers", label: "Преподаватели" },
					{
						href: `/timetable/lecturers/${lecturerId ?? ""}`,
						label: lecturerName || "Преподаватель",
						loading: isLecturerLoading,
					},
				]}
			/>
			<Container>
				{hasError ? (
					<Flex alignItems="flex-start" direction="column" gap={2}>
						<Text variant="header-2">Преподаватель не найден</Text>
						<Text color="secondary">Проверьте ссылку или попробуйте загрузить данные ещё раз.</Text>
						{lecturerId && <Button onClick={() => void refetch()}>Повторить</Button>}
					</Flex>
				) : (
					lecturerId &&
					lecturer && (
						<>
							<LecturerPhotos lecturerId={lecturerId} lecturerName={lecturerName} />
							<TimetableSchedule lecturerId={lecturerId} />
						</>
					)
				)}
			</Container>
		</>
	);
};

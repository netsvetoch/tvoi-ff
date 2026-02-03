import { DefinitionList, Flex, Skeleton, Text } from "@gravity-ui/uikit";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";

import { getLecturerLecturerIdGetOptions } from "@/shared/api/rating/@tanstack/react-query.gen";
import { getLecturerFullname, numberDeclensions } from "@/shared/helpers";
import { formatNumber } from "@/shared/helpers/formatNumber";
import { getTextNumberColor } from "@/shared/helpers/getTextNumberColor";
import { Container, PageHeader } from "@/shared/ui";

import { ProfileAvatar } from "../profile/ui";
import { LecturerComment } from "./ui/LecturerComment";

export const LecturerRatingPage = () => {
	const { lecturerId } = useParams();

	const { data: lecturer, isLoading } = useQuery(
		getLecturerLecturerIdGetOptions({
			path: { id: Number(lecturerId) },
			query: { info: ["comments"] },
		})
	);

	const fullName = lecturer ? getLecturerFullname(lecturer) : "";

	const imgUrl = lecturer?.avatar_link
		? `https://api.profcomff.com/timetable/static/photo/lecturer/${lecturer.avatar_link}`
		: "kek";

	return (
		<>
			<PageHeader
				breadcrumbs={[
					{ href: "/rating", label: "Дубинушка" },
					{ href: `/rating/lecturer/${lecturerId}`, label: fullName, loading: isLoading },
				]}
			/>
			<Container>
				<Flex direction="column" gap={3}>
					{isLoading ? <Skeleton style={{ height: 24 }} /> : <Text variant="header-1">{fullName}</Text>}

					<Flex alignItems="center" gap={3}>
						<ProfileAvatar imgUrl={imgUrl} loading={isLoading} name={fullName} />
						<DefinitionList direction="vertical">
							<DefinitionList.Item name="Средняя доброта">
								{isLoading ? (
									<Skeleton style={{ height: 15.5, width: 34 }} />
								) : (
									<Text color={getTextNumberColor(lecturer?.mark_kindness_weighted)}>
										{lecturer?.mark_kindness_weighted ? formatNumber(lecturer.mark_kindness_weighted) : "-"}
									</Text>
								)}
							</DefinitionList.Item>
							<DefinitionList.Item name="Средняя халявность">
								{isLoading ? (
									<Skeleton style={{ height: 15.5, width: 34 }} />
								) : (
									<Text color={getTextNumberColor(lecturer?.mark_freebie_weighted)}>
										{lecturer?.mark_freebie_weighted ? formatNumber(lecturer.mark_freebie_weighted) : "-"}
									</Text>
								)}
							</DefinitionList.Item>
							<DefinitionList.Item name="Средняя понятность">
								{isLoading ? (
									<Skeleton style={{ height: 15.5, width: 34 }} />
								) : (
									<Text color={getTextNumberColor(lecturer?.mark_clarity_weighted)}>
										{lecturer?.mark_clarity_weighted ? formatNumber(lecturer.mark_clarity_weighted) : "-"}
									</Text>
								)}
							</DefinitionList.Item>
						</DefinitionList>
					</Flex>

					{isLoading ? (
						<Skeleton style={{ height: 18, width: 200 }} />
					) : (
						<Text color="secondary" style={{ fontStyle: "italic" }}>
							{lecturer?.comments?.length
								? numberDeclensions(lecturer.comments.length, "отзыв", "отзыва", "отзывов")
								: "Нет комментариев "}
						</Text>
					)}

					<Flex direction="column" gap={3}>
						{lecturer?.comments?.map(comment => (
							<LecturerComment comment={comment} key={comment.uuid} />
						))}
					</Flex>
				</Flex>
			</Container>
		</>
	);
};

import { Button, Card, DefinitionList, Dialog, Flex, Skeleton, spacing, Text, useToaster } from "@gravity-ui/uikit";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";

import {
	deleteCommentCommentUuidDeleteMutation,
	getLecturerLecturerIdGetOptions,
} from "@/shared/api/rating/@tanstack/react-query.gen";
import { getLecturerPhotosLecturerLecturerIdPhotoGetOptions } from "@/shared/api/timetable/@tanstack/react-query.gen";
import { client as timetableClient } from "@/shared/api/timetable/client.gen";
import { getLecturerFullname, numberDeclensions, resolveTimetablePhotoUrl } from "@/shared/helpers";
import { formatNumber } from "@/shared/helpers/formatNumber";
import { getTextNumberColor } from "@/shared/helpers/getTextNumberColor";
import { useLoginData } from "@/shared/hooks";
import { Container, PageHeader } from "@/shared/ui";

import { ProfileAvatar } from "../profile/ui";
import { LecturerComment, RatingCommentForm } from "./ui";

export const LecturerRatingPage = () => {
	const { id: lecturerId } = useParams({ from: "/rating/lecturer/$id" });
	const lecturerIdNumber = Number(lecturerId);

	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const toaster = useToaster();
	const { token, user_id: currentUserId } = useLoginData();

	const [editingCommentUuid, setEditingCommentUuid] = useState<null | string>(null);
	const [deletingCommentUuid, setDeletingCommentUuid] = useState<null | string>(null);

	const lecturerOptions = getLecturerLecturerIdGetOptions({
		auth: token,
		path: { id: lecturerIdNumber },
		query: { info: ["comments"] },
	});

	const { data: lecturer, isLoading } = useQuery(lecturerOptions);

	const fullName = lecturer ? getLecturerFullname(lecturer) : "";
	const photosQuery = useQuery({
		...getLecturerPhotosLecturerLecturerIdPhotoGetOptions({
			path: { lecturer_id: lecturer?.timetable_id ?? 0 },
			query: { limit: 1 },
		}),
		enabled: Boolean(lecturer?.timetable_id),
	});
	const imgUrl = resolveTimetablePhotoUrl(photosQuery.data?.items[0], timetableClient.getConfig().baseUrl);

	const deleteMutation = useMutation({
		...deleteCommentCommentUuidDeleteMutation(),
		onError: error => {
			toaster.add({
				content: "ru" in error ? (error.ru as string) : "Неизвестная ошибка",
				name: "rating-comment-delete-error",
				theme: "danger",
			});
		},
		onSuccess: () => {
			setDeletingCommentUuid(null);
			toaster.add({
				content: "Отзыв удалён.",
				name: "rating-comment-delete-success",
				theme: "success",
			});
			void queryClient.invalidateQueries({ queryKey: lecturerOptions.queryKey });
		},
	});

	return (
		<>
			<PageHeader
				breadcrumbs={[
					{ href: "/rating", label: "Дубинушка" },
					{ href: `/rating/lecturer/${lecturerId}`, label: fullName, loading: isLoading },
				]}
			/>
			<Container>
				<Flex direction={"column"} gap={3}>
					{isLoading ? <Skeleton style={{ height: 24 }} /> : <Text variant="header-1">{fullName}</Text>}

					<Flex alignItems={"center"} gap={3}>
						<ProfileAvatar imgUrl={imgUrl} loading={isLoading || photosQuery.isLoading} name={fullName} />
						<DefinitionList direction="vertical">
							<DefinitionList.Item name="Средняя доброта">
								{isLoading ? (
									<Skeleton style={{ height: 15.5, width: 34 }} />
								) : (
									<Text color={getTextNumberColor(lecturer?.mark_kindness_weighted)}>
										{lecturer?.mark_kindness_weighted ? formatNumber(lecturer?.mark_kindness_weighted) : "-"}
									</Text>
								)}
							</DefinitionList.Item>
							<DefinitionList.Item name="Средняя халявность">
								{isLoading ? (
									<Skeleton style={{ height: 15.5, width: 34 }} />
								) : (
									<Text color={getTextNumberColor(lecturer?.mark_freebie_weighted)}>
										{lecturer?.mark_freebie_weighted ? formatNumber(lecturer?.mark_freebie_weighted) : "-"}
									</Text>
								)}
							</DefinitionList.Item>
							<DefinitionList.Item name="Средняя понятность">
								{isLoading ? (
									<Skeleton style={{ height: 15.5, width: 34 }} />
								) : (
									<Text color={getTextNumberColor(lecturer?.mark_clarity_weighted)}>
										{lecturer?.mark_clarity_weighted ? formatNumber(lecturer?.mark_clarity_weighted) : "-"}
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
								? numberDeclensions(lecturer?.comments?.length, "отзыв", "отзыва", "отзывов")
								: "Нет комментариев "}
						</Text>
					)}

					<Flex direction={"column"} gap={3}>
						{lecturer?.comments?.map(comment =>
							comment.uuid === editingCommentUuid ? (
								<Card className={spacing({ p: 3 })} key={comment.uuid}>
									<RatingCommentForm
										comment={comment}
										lecturerId={lecturerIdNumber}
										onDone={() => setEditingCommentUuid(null)}
									/>
								</Card>
							) : (
								<LecturerComment
									comment={comment}
									key={comment.uuid}
									lecturerQueryKey={lecturerOptions.queryKey}
									onDelete={
										currentUserId !== undefined && comment.user_id === currentUserId
											? () => setDeletingCommentUuid(comment.uuid)
											: undefined
									}
									onEdit={
										currentUserId !== undefined && comment.user_id === currentUserId
											? () => setEditingCommentUuid(comment.uuid)
											: undefined
									}
								/>
							)
						)}
					</Flex>

					<Card className={spacing({ p: 3 })}>
						{token ? (
							<RatingCommentForm lecturerId={lecturerIdNumber} />
						) : (
							<Flex alignItems="center" direction="column" gap={2}>
								<Text>Войдите, чтобы оставить отзыв о преподавателе.</Text>
								<Button onClick={() => navigate({ to: "/login" })} view="outlined-action">
									Войти
								</Button>
							</Flex>
						)}
					</Card>
				</Flex>
			</Container>

			<Dialog onClose={() => setDeletingCommentUuid(null)} open={Boolean(deletingCommentUuid)} size="s">
				<Dialog.Header caption="Удалить отзыв?" />
				<Dialog.Body>
					<Text>Отзыв будет удалён без возможности восстановления.</Text>
				</Dialog.Body>
				<Dialog.Footer
					loading={deleteMutation.isPending}
					onClickButtonApply={() => {
						if (deletingCommentUuid && token) {
							deleteMutation.mutate({ auth: token, path: { uuid: deletingCommentUuid } });
						}
					}}
					onClickButtonCancel={() => setDeletingCommentUuid(null)}
					preset="danger"
					textButtonApply="Удалить"
					textButtonCancel="Отмена"
				/>
			</Dialog>
		</>
	);
};

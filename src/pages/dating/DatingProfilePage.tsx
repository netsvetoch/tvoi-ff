import { dateTime } from "@gravity-ui/date-utils";
import { Pencil, TrashBin } from "@gravity-ui/icons";
import {
	Avatar,
	Button,
	Card,
	DefinitionList,
	Dialog,
	Flex,
	Skeleton,
	spacing,
	Text,
	useToaster,
} from "@gravity-ui/uikit";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";

import {
	deleteCommentCommentsCommentsCommentIdDeleteMutation,
	deleteProfileProfilesProfileIdDeleteMutation,
	getCommentsForProfileCommentsProfilesProfileIdCommentsGetInfiniteOptions,
	getCommentsForProfileCommentsProfilesProfileIdCommentsGetInfiniteQueryKey,
	getProfileProfilesProfileIdGetOptions,
	getProfilesProfilesGetInfiniteQueryKey,
	updateProfileProfilesProfileIdPutMutation,
} from "@/shared/api/dating/@tanstack/react-query.gen";
import { numberDeclensions } from "@/shared/helpers";
import { Container, PageHeader } from "@/shared/ui";

import { COMMENTS_PAGE_SIZE, getDatingErrorMessage } from "./helpers";
import { DatingCommentCard, DatingCommentForm, ProfileForm, type ProfileFormValues } from "./ui";

export const DatingProfilePage = () => {
	const { id } = useParams({ from: "/dating/$id" });
	const profileId = Number(id);
	const isValidId = Number.isInteger(profileId) && profileId > 0;

	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const toaster = useToaster();

	const [isEditing, setIsEditing] = useState(false);
	const [isDeletingProfile, setIsDeletingProfile] = useState(false);
	const [deletingCommentId, setDeletingCommentId] = useState<null | number>(null);

	const profileOptions = getProfileProfilesProfileIdGetOptions({ path: { profile_id: profileId } });
	const { data: profile, isError, isLoading } = useQuery({ ...profileOptions, enabled: isValidId, retry: false });

	const commentsQuery = useInfiniteQuery({
		...getCommentsForProfileCommentsProfilesProfileIdCommentsGetInfiniteOptions({
			path: { profile_id: profileId },
			query: { limit: COMMENTS_PAGE_SIZE },
		}),
		enabled: isValidId,
		getNextPageParam: (lastPage, allPages) =>
			lastPage.length === COMMENTS_PAGE_SIZE ? allPages.length + 1 : undefined,
		initialPageParam: 1,
	});

	const comments = commentsQuery.data?.pages.flat() ?? [];

	const listQueryKey = getProfilesProfilesGetInfiniteQueryKey();
	const commentsQueryKey = getCommentsForProfileCommentsProfilesProfileIdCommentsGetInfiniteQueryKey({
		path: { profile_id: profileId },
	});

	const updateMutation = useMutation({
		...updateProfileProfilesProfileIdPutMutation(),
		onError: toastError => {
			toaster.add({
				content: getDatingErrorMessage(toastError),
				name: "dating-profile-update-error",
				theme: "danger",
			});
		},
		onSuccess: () => {
			setIsEditing(false);
			toaster.add({
				content: "Анкета обновлена.",
				name: "dating-profile-update-success",
				theme: "success",
			});
			void queryClient.invalidateQueries({ queryKey: profileOptions.queryKey });
			void queryClient.invalidateQueries({ queryKey: listQueryKey });
		},
	});

	const deleteProfileMutation = useMutation({
		...deleteProfileProfilesProfileIdDeleteMutation(),
		onError: toastError => {
			toaster.add({
				content: getDatingErrorMessage(toastError),
				name: "dating-profile-delete-error",
				theme: "danger",
			});
		},
		onSuccess: () => {
			setIsDeletingProfile(false);
			toaster.add({
				content: "Анкета удалена.",
				name: "dating-profile-delete-success",
				theme: "success",
			});
			void queryClient.invalidateQueries({ queryKey: listQueryKey });
			navigate({ to: "/dating" });
		},
	});

	const deleteCommentMutation = useMutation({
		...deleteCommentCommentsCommentsCommentIdDeleteMutation(),
		onError: toastError => {
			toaster.add({
				content: getDatingErrorMessage(toastError),
				name: "dating-comment-delete-error",
				theme: "danger",
			});
		},
		onSuccess: () => {
			setDeletingCommentId(null);
			toaster.add({
				content: "Комментарий удалён.",
				name: "dating-comment-delete-success",
				theme: "success",
			});
			void queryClient.invalidateQueries({ queryKey: commentsQueryKey });
			void queryClient.invalidateQueries({ queryKey: profileOptions.queryKey });
		},
	});

	const submitUpdate = (values: ProfileFormValues) => {
		updateMutation.mutate({
			body: {
				age: values.age,
				contact: values.contact,
				description: values.description || null,
				gender: values.gender,
				interests: values.interests || null,
				name: values.name,
			},
			path: { profile_id: profileId },
		});
	};

	if (!isValidId || (isError && !isLoading)) {
		return (
			<>
				<PageHeader breadcrumbs={[{ href: "/dating", label: "Знакомства" }]} />
				<Container>
					<Flex alignItems="center" direction="column" gap={2} style={{ minHeight: 300 }}>
						<Text variant="header-1">Анкета не найдена</Text>
						<Text color="secondary">Возможно, она была удалена.</Text>
						<Button onClick={() => navigate({ to: "/dating" })} view="outlined-action">
							К списку анкет
						</Button>
					</Flex>
				</Container>
			</>
		);
	}

	return (
		<>
			<PageHeader
				breadcrumbs={[
					{ href: "/dating", label: "Знакомства" },
					{
						href: `/dating/${id}`,
						label: profile ? `${profile.name}, ${profile.age}` : "Анкета",
						loading: isLoading,
					},
				]}
			/>
			<Container>
				<Flex direction="column" gap={3}>
					{isEditing && profile ? (
						<Card className={spacing({ p: 3 })}>
							<ProfileForm
								initialValues={profile}
								onCancel={() => setIsEditing(false)}
								onSubmit={submitUpdate}
								pending={updateMutation.isPending}
								submitLabel="Сохранить изменения"
							/>
						</Card>
					) : (
						<Card className={spacing({ p: 3 })}>
							<Flex direction="column" gap={3}>
								{isLoading ? (
									<Skeleton style={{ height: 24, width: 200 }} />
								) : (
									<Text variant="header-1">
										{profile?.name}, {profile?.age}
									</Text>
								)}

								<Flex alignItems="flex-start" gap={3}>
									{isLoading ? (
										<Skeleton style={{ borderRadius: 999, height: 64, width: 64 }} />
									) : (
										<Avatar size="xl" text={profile?.name || "?"} />
									)}
									<DefinitionList direction="vertical">
										<DefinitionList.Item name="Пол">
											{isLoading ? <Skeleton style={{ height: 15.5, width: 80 }} /> : profile?.gender}
										</DefinitionList.Item>
										<DefinitionList.Item name="Контакт">
											{isLoading ? <Skeleton style={{ height: 15.5, width: 120 }} /> : profile?.contact}
										</DefinitionList.Item>
										<DefinitionList.Item name="Интересы">
											{isLoading ? <Skeleton style={{ height: 15.5, width: 120 }} /> : profile?.interests || "-"}
										</DefinitionList.Item>
										<DefinitionList.Item name="Создана">
											{isLoading ? (
												<Skeleton style={{ height: 15.5, width: 100 }} />
											) : (
												profile && dateTime({ input: profile.created_ts }).format("DD.MM.YYYY HH:mm")
											)}
										</DefinitionList.Item>
									</DefinitionList>
								</Flex>

								{isLoading ? (
									<Skeleton style={{ height: 18, width: "60%" }} />
								) : (
									<Text style={{ whiteSpace: "pre-wrap" }}>{profile?.description || "Без описания"}</Text>
								)}

								<Flex gap={2}>
									<Button disabled={isLoading} onClick={() => setIsEditing(true)} view="outlined">
										<Pencil />
										Редактировать
									</Button>
									<Button disabled={isLoading} onClick={() => setIsDeletingProfile(true)} view="outlined-danger">
										<TrashBin />
										Удалить
									</Button>
								</Flex>
							</Flex>
						</Card>
					)}

					{isLoading ? (
						<Skeleton style={{ height: 18, width: 200 }} />
					) : (
						<Text color="secondary" style={{ fontStyle: "italic" }}>
							{comments.length > 0
								? numberDeclensions(comments.length, "комментарий", "комментария", "комментариев")
								: "Нет комментариев"}
						</Text>
					)}

					<Flex direction="column" gap={3}>
						{comments.map(comment => (
							<DatingCommentCard comment={comment} key={comment.id} onDelete={() => setDeletingCommentId(comment.id)} />
						))}
						{commentsQuery.hasNextPage && (
							<Flex justifyContent="center">
								<Button loading={commentsQuery.isFetchingNextPage} onClick={() => commentsQuery.fetchNextPage()}>
									Показать ещё
								</Button>
							</Flex>
						)}
					</Flex>

					<Card className={spacing({ p: 3 })}>
						<DatingCommentForm profileId={profileId} />
					</Card>
				</Flex>
			</Container>

			<Dialog onClose={() => setIsDeletingProfile(false)} open={isDeletingProfile} size="s">
				<Dialog.Header caption="Удалить анкету?" />
				<Dialog.Body>
					<Text>Анкета будет удалена без возможности восстановления.</Text>
				</Dialog.Body>
				<Dialog.Footer
					loading={deleteProfileMutation.isPending}
					onClickButtonApply={() => {
						deleteProfileMutation.mutate({ path: { profile_id: profileId } });
					}}
					onClickButtonCancel={() => setIsDeletingProfile(false)}
					preset="danger"
					textButtonApply="Удалить"
					textButtonCancel="Отмена"
				/>
			</Dialog>

			<Dialog onClose={() => setDeletingCommentId(null)} open={deletingCommentId !== null} size="s">
				<Dialog.Header caption="Удалить комментарий?" />
				<Dialog.Body>
					<Text>Комментарий будет удалён без возможности восстановления.</Text>
				</Dialog.Body>
				<Dialog.Footer
					loading={deleteCommentMutation.isPending}
					onClickButtonApply={() => {
						if (deletingCommentId !== null) {
							deleteCommentMutation.mutate({ path: { comment_id: deletingCommentId } });
						}
					}}
					onClickButtonCancel={() => setDeletingCommentId(null)}
					preset="danger"
					textButtonApply="Удалить"
					textButtonCancel="Отмена"
				/>
			</Dialog>
		</>
	);
};

import { dateTime } from "@gravity-ui/date-utils";
import { Pencil, ThumbsDown, ThumbsDownFill, ThumbsUp, ThumbsUpFill, TrashBin } from "@gravity-ui/icons";
import { Button, Card, Flex, Icon, spacing, Text, useToaster } from "@gravity-ui/uikit";
import { type QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import type { CommentGet, LecturerGet } from "@/shared/api/rating/types.gen";

import { likeCommentCommentUuidReactionPutMutation } from "@/shared/api/rating/@tanstack/react-query.gen";
import { formatNumber, getTextNumberColor } from "@/shared/helpers";
import { useLoginData } from "@/shared/hooks";

interface LecturerCommentProps {
	comment: CommentGet;
	lecturerQueryKey: QueryKey;
	onDelete?: () => void;
	onEdit?: () => void;
}

export const LecturerComment = ({ comment, lecturerQueryKey, onDelete, onEdit }: LecturerCommentProps) => {
	const {
		create_ts,
		dislike_count,
		is_disliked,
		is_liked,
		like_count,
		mark_clarity,
		mark_freebie,
		mark_general,
		mark_kindness,
		text,
		user_fullname,
		uuid,
	} = comment;

	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const toaster = useToaster();
	const { token } = useLoginData();

	const reactionMutation = useMutation({
		...likeCommentCommentUuidReactionPutMutation(),
		onError: () => {
			toaster.add({
				content: "Не удалось изменить реакцию. Попробуйте ещё раз.",
				name: "rating-comment-reaction-error",
				theme: "danger",
			});
			void queryClient.invalidateQueries({ queryKey: lecturerQueryKey });
		},
		onSuccess: updatedComment => {
			queryClient.setQueryData<LecturerGet>(lecturerQueryKey, lecturer => {
				if (!lecturer?.comments) {
					return lecturer;
				}

				return {
					...lecturer,
					comments: lecturer.comments.map(item => (item.uuid === updatedComment.uuid ? updatedComment : item)),
				};
			});
		},
	});

	const react = (reaction: "dislike" | "like") => {
		if (!token) {
			navigate({ to: "/login" });
			return;
		}

		if (reactionMutation.isPending) {
			return;
		}

		reactionMutation.mutate({ auth: token, path: { reaction, uuid } });
	};

	return (
		<Card className={spacing({ p: 3 })}>
			<Flex direction={"column"} gap={2}>
				<div style={{ alignItems: "center", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
					<Text color={getTextNumberColor(mark_kindness)}>
						{mark_kindness >= 0 ? "Доброта" : "Злобность"}: {Math.abs(mark_kindness).toFixed(2)}
					</Text>
					<Text color={getTextNumberColor(mark_freebie)}>
						{mark_freebie >= 0 ? "Халявность" : "Строгость"}: {Math.abs(mark_freebie).toFixed(2)}
					</Text>
					<Text color={getTextNumberColor(mark_clarity)}>
						{mark_clarity >= 0 ? "Понятность" : "Бредовость"} {Math.abs(mark_clarity).toFixed(2)}
					</Text>
					<Flex alignItems="center" gap={1} justifyContent="flex-end">
						{(onDelete || onEdit) && (
							<>
								{onEdit && (
									<Button onClick={onEdit} size="s" title="Изменить отзыв" view="flat">
										<Icon data={Pencil} size={14} />
									</Button>
								)}
								{onDelete && (
									<Button onClick={onDelete} size="s" title="Удалить отзыв" view="flat">
										<Icon data={TrashBin} size={14} />
									</Button>
								)}
							</>
						)}
						<Text color={getTextNumberColor(mark_general)} style={{ fontWeight: 700 }}>
							{formatNumber(mark_general)}
						</Text>
					</Flex>
				</div>
				<p
					dangerouslySetInnerHTML={{
						__html: text.replaceAll(String.raw`\n`, "<br>").replaceAll(String.raw`\"`, '"'),
					}}
				/>
				<Flex alignItems="center" gap={2} justifyContent="flex-end">
					<Button
						disabled={reactionMutation.isPending && Boolean(token)}
						onClick={() => react("like")}
						selected={is_liked}
						size="s"
						view={is_liked ? "outlined-action" : "flat"}
					>
						<Icon data={is_liked ? ThumbsUpFill : ThumbsUp} size={14} />
						{like_count}
					</Button>
					<Button
						disabled={reactionMutation.isPending && Boolean(token)}
						onClick={() => react("dislike")}
						selected={is_disliked}
						size="s"
						view={is_disliked ? "outlined-danger" : "flat"}
					>
						<Icon data={is_disliked ? ThumbsDownFill : ThumbsDown} size={14} />
						{dislike_count}
					</Button>
					<Text color="secondary">
						{dateTime({ input: create_ts }).format("DD.MM.YYYY")} | Автор: {user_fullname ?? "Аноним"}
					</Text>
				</Flex>
			</Flex>
		</Card>
	);
};

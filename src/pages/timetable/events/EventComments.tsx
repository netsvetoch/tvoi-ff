import type { FormEvent } from "react";

import { dateTime } from "@gravity-ui/date-utils";
import { Button, Flex, Skeleton, Text, TextArea, TextInput, useToaster } from "@gravity-ui/uikit";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
	commentEventEventEventIdCommentPostMutation,
	getEventCommentsEventEventIdCommentGetOptions,
	getEventCommentsEventEventIdCommentGetQueryKey,
} from "@/shared/api/timetable/@tanstack/react-query.gen";

import styles from "./EventInteractions.module.css";

interface EventCommentsProps {
	eventId: number;
}

export const EventComments = ({ eventId }: EventCommentsProps) => {
	const toaster = useToaster();
	const queryClient = useQueryClient();
	const [authorName, setAuthorName] = useState("");
	const [text, setText] = useState("");
	const [invalidFields, setInvalidFields] = useState({ authorName: false, text: false });
	const commentsOptions = getEventCommentsEventEventIdCommentGetOptions({
		path: { event_id: eventId },
		query: { limit: 100 },
	});
	const commentsQuery = useQuery(commentsOptions);
	const comments = (commentsQuery.data?.items ?? []).toSorted(
		(first, second) => Date.parse(second.create_ts) - Date.parse(first.create_ts)
	);
	const commentMutation = useMutation({
		...commentEventEventEventIdCommentPostMutation(),
		onError: () => {
			toaster.add({
				content: "Комментарий не отправлен. Проверьте соединение и попробуйте ещё раз.",
				name: "event-comment-error",
				theme: "danger",
			});
		},
		onSuccess: async () => {
			setText("");
			toaster.add({
				content: "Комментарий отправлен и может появиться после модерации.",
				name: "event-comment-success",
				theme: "success",
			});
			await queryClient.invalidateQueries({
				queryKey: getEventCommentsEventEventIdCommentGetQueryKey({
					path: { event_id: eventId },
					query: { limit: 100 },
				}),
			});
		},
	});

	const submitComment = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const trimmedAuthorName = authorName.trim();
		const trimmedText = text.trim();
		const nextInvalidFields = { authorName: !trimmedAuthorName, text: !trimmedText };

		setInvalidFields(nextInvalidFields);

		if (nextInvalidFields.authorName || nextInvalidFields.text || commentMutation.isPending) {
			return;
		}

		commentMutation.mutate({
			body: { author_name: trimmedAuthorName, text: trimmedText },
			path: { event_id: eventId },
		});
	};

	return (
		<section aria-labelledby="event-comments-title" className={styles.section}>
			<Flex direction="column" gap={3}>
				<Text as="h2" id="event-comments-title" variant="header-2">
					Комментарии
				</Text>
				{commentsQuery.isLoading && (
					<Flex direction="column" gap={2}>
						<Skeleton style={{ height: 56 }} />
						<Skeleton style={{ height: 56 }} />
					</Flex>
				)}
				{commentsQuery.isError && (
					<Flex alignItems="flex-start" direction="column" gap={2}>
						<Text color="danger">Не удалось загрузить комментарии.</Text>
						<Button onClick={() => void commentsQuery.refetch()} view="outlined">
							Повторить
						</Button>
					</Flex>
				)}
				{commentsQuery.isSuccess && comments.length === 0 && <Text color="secondary">Комментариев пока нет.</Text>}
				{comments.map(comment => (
					<article className={styles.comment} key={comment.id}>
						<Flex direction="column" gap={1}>
							<Flex alignItems="baseline" gap={2} wrap="wrap">
								<Text variant="subheader-2">{comment.author_name}</Text>
								<Text color="secondary" variant="caption-1">
									{dateTime({ input: comment.create_ts }).format("D MMMM YYYY, HH:mm")}
								</Text>
							</Flex>
							<Text className={styles.commentText}>{comment.text}</Text>
						</Flex>
					</article>
				))}
				<form className={styles.form} onSubmit={submitComment}>
					<Flex direction="column" gap={3}>
						<Text variant="subheader-1">Добавить комментарий</Text>
						<TextInput
							autoComplete="name"
							errorMessage={invalidFields.authorName ? "Укажите имя" : undefined}
							label="Имя"
							name="author_name"
							onUpdate={value => {
								setAuthorName(value);
								if (value.trim()) setInvalidFields(current => ({ ...current, authorName: false }));
							}}
							validationState={invalidFields.authorName ? "invalid" : undefined}
							value={authorName}
						/>
						<TextArea
							controlProps={{ style: { resize: "vertical" } }}
							errorMessage={invalidFields.text ? "Введите текст комментария" : undefined}
							minRows={3}
							name="text"
							onUpdate={value => {
								setText(value);
								if (value.trim()) setInvalidFields(current => ({ ...current, text: false }));
							}}
							placeholder="Ваш комментарий"
							validationState={invalidFields.text ? "invalid" : undefined}
							value={text}
						/>
						<Button loading={commentMutation.isPending} type="submit" view="action">
							Отправить комментарий
						</Button>
					</Flex>
				</form>
			</Flex>
		</section>
	);
};

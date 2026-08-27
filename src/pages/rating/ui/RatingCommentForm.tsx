import { Button, Checkbox, Flex, Slider, Text, TextArea, TextInput, useToaster } from "@gravity-ui/uikit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import type { CommentGet } from "@/shared/api/rating/types.gen";

import {
	createCommentCommentPostMutation,
	getLecturerLecturerIdGetQueryKey,
	updateCommentCommentUuidPatchMutation,
} from "@/shared/api/rating/@tanstack/react-query.gen";
import { useLoginData } from "@/shared/hooks";

interface RatingCommentFormProps {
	comment?: CommentGet;
	lecturerId: number;
	onDone?: () => void;
}

const MARK_SLIDERS = [
	{ key: "kindness", leftHint: "Злобный", rightHint: "Добрый", title: "Доброта" },
	{ key: "freebie", leftHint: "Строгий", rightHint: "Халявный", title: "Халявность" },
	{ key: "clarity", leftHint: "Бредовый", rightHint: "Понятный", title: "Понятность" },
] as const;

type MarkKey = (typeof MARK_SLIDERS)[number]["key"];

export const RatingCommentForm = ({ comment, lecturerId, onDone }: RatingCommentFormProps) => {
	const { token } = useLoginData();
	const toaster = useToaster();
	const queryClient = useQueryClient();

	const [marks, setMarks] = useState<Record<MarkKey, number>>(() =>
		comment
			? { clarity: comment.mark_clarity, freebie: comment.mark_freebie, kindness: comment.mark_kindness }
			: { clarity: 0, freebie: 0, kindness: 0 }
	);
	const [subject, setSubject] = useState(comment?.subject ?? "");
	const [text, setText] = useState(comment?.text ?? "");
	const [isAnonymous, setIsAnonymous] = useState(false);
	const [textInvalid, setTextInvalid] = useState(false);

	const isEditing = Boolean(comment);

	const lecturerQueryKey = getLecturerLecturerIdGetQueryKey({
		path: { id: lecturerId },
		query: { info: ["comments"] },
	});

	const createMutation = useMutation({
		...createCommentCommentPostMutation(),
		onError: error => {
			toaster.add({
				content: "ru" in error ? (error.ru as string) : "Неизвестная ошибка",
				name: "rating-comment-create-error",
				theme: "danger",
			});
		},
		onSuccess: () => {
			setMarks({ clarity: 0, freebie: 0, kindness: 0 });
			setSubject("");
			setText("");
			setIsAnonymous(false);
			toaster.add({
				content: "Отзыв отправлен и появится после модерации.",
				name: "rating-comment-create-success",
				theme: "success",
			});
			void queryClient.invalidateQueries({ queryKey: lecturerQueryKey });
			onDone?.();
		},
	});

	const updateMutation = useMutation({
		...updateCommentCommentUuidPatchMutation(),
		onError: error => {
			toaster.add({
				content: "ru" in error ? (error.ru as string) : "Неизвестная ошибка",
				name: "rating-comment-update-error",
				theme: "danger",
			});
		},
		onSuccess: () => {
			toaster.add({
				content: "Изменения сохранены. Отзыв появится после повторной модерации.",
				name: "rating-comment-update-success",
				theme: "success",
			});
			void queryClient.invalidateQueries({ queryKey: lecturerQueryKey });
			onDone?.();
		},
	});

	const isPending = createMutation.isPending || updateMutation.isPending;

	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!token || isPending) {
			return;
		}

		const trimmedText = text.trim();
		const trimmedSubject = subject.trim();

		if (!trimmedText) {
			setTextInvalid(true);
			return;
		}

		if (isEditing && comment) {
			updateMutation.mutate({
				auth: token,
				body: {
					mark_clarity: marks.clarity,
					mark_freebie: marks.freebie,
					mark_kindness: marks.kindness,
					subject: trimmedSubject || undefined,
					text: trimmedText,
				},
				path: { uuid: comment.uuid },
			});
			return;
		}

		createMutation.mutate({
			auth: token,
			body: {
				is_anonymous: isAnonymous,
				mark_clarity: marks.clarity,
				mark_freebie: marks.freebie,
				mark_kindness: marks.kindness,
				subject: trimmedSubject || undefined,
				text: trimmedText,
			},
			query: { lecturer_id: lecturerId },
		});
	};

	return (
		<form onSubmit={submit}>
			<Flex direction="column" gap={3}>
				<Flex direction="column" gap={2}>
					{MARK_SLIDERS.map(({ key, leftHint, rightHint, title }) => (
						<Flex direction="column" gap={1} key={key}>
							<Flex alignItems="center" gap={2}>
								<Text variant="subheader-1">{title}</Text>
								<Text color="secondary">{marks[key] > 0 ? `+${marks[key]}` : marks[key]}</Text>
							</Flex>
							<Slider
								marks={5}
								max={2}
								min={-2}
								onUpdate={value => {
									setMarks(current => ({ ...current, [key]: value as number }));
								}}
								startPoint={0}
								step={1}
								value={marks[key]}
							/>
							<Flex justifyContent="space-between">
								<Text color="secondary" variant="caption-2">
									{leftHint}
								</Text>
								<Text color="secondary" variant="caption-2">
									{rightHint}
								</Text>
							</Flex>
						</Flex>
					))}
				</Flex>
				<TextInput label="Предмет" onUpdate={setSubject} placeholder="Необязательно" value={subject} />
				<Text variant="subheader-1">Текст отзыва</Text>
				<TextArea
					controlProps={{ style: { resize: "vertical" } }}
					errorMessage={textInvalid ? "Введите текст отзыва" : undefined}
					minRows={3}
					onUpdate={value => {
						setText(value);
						if (value.trim()) setTextInvalid(false);
					}}
					placeholder="Поделитесь впечатлениями"
					validationState={textInvalid ? "invalid" : undefined}
					value={text}
				/>
				{!isEditing && (
					<Checkbox
						checked={isAnonymous}
						content="Анонимный отзыв"
						onUpdate={setIsAnonymous}
						title="Анонимный отзыв нельзя изменить или удалить самостоятельно"
					/>
				)}
				<Flex gap={2}>
					<Button loading={isPending} type="submit" view="action">
						{isEditing ? "Сохранить изменения" : "Отправить отзыв"}
					</Button>
					{isEditing && (
						<Button disabled={isPending} onClick={onDone} type="button">
							Отмена
						</Button>
					)}
				</Flex>
			</Flex>
		</form>
	);
};

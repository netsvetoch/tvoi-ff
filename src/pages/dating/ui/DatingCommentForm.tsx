import { Button, Flex, Text, TextArea, TextInput, useToaster } from "@gravity-ui/uikit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import {
	createCommentForProfileCommentsProfilesProfileIdCommentsPostMutation,
	getCommentsForProfileCommentsProfilesProfileIdCommentsGetInfiniteQueryKey,
	getProfileProfilesProfileIdGetQueryKey,
} from "@/shared/api/dating/@tanstack/react-query.gen";

import { getDatingErrorMessage } from "../helpers";

interface DatingCommentFormProps {
	profileId: number;
}

export const DatingCommentForm = ({ profileId }: DatingCommentFormProps) => {
	const toaster = useToaster();
	const queryClient = useQueryClient();

	const [authorName, setAuthorName] = useState("");
	const [content, setContent] = useState("");
	const [authorNameInvalid, setAuthorNameInvalid] = useState(false);
	const [contentInvalid, setContentInvalid] = useState(false);

	const commentsQueryKey = getCommentsForProfileCommentsProfilesProfileIdCommentsGetInfiniteQueryKey({
		path: { profile_id: profileId },
	});
	const profileQueryKey = getProfileProfilesProfileIdGetQueryKey({ path: { profile_id: profileId } });

	const createMutation = useMutation({
		...createCommentForProfileCommentsProfilesProfileIdCommentsPostMutation(),
		onError: error => {
			toaster.add({
				content: getDatingErrorMessage(error),
				name: "dating-comment-create-error",
				theme: "danger",
			});
		},
		onSuccess: () => {
			setAuthorName("");
			setContent("");
			toaster.add({
				content: "Комментарий добавлен.",
				name: "dating-comment-create-success",
				theme: "success",
			});
			void queryClient.invalidateQueries({ queryKey: commentsQueryKey });
			void queryClient.invalidateQueries({ queryKey: profileQueryKey });
		},
	});

	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (createMutation.isPending) {
			return;
		}

		const trimmedAuthorName = authorName.trim();
		const trimmedContent = content.trim();

		const isAuthorNameValid = Boolean(trimmedAuthorName);
		const isContentValid = Boolean(trimmedContent);

		setAuthorNameInvalid(!isAuthorNameValid);
		setContentInvalid(!isContentValid);

		if (!isAuthorNameValid || !isContentValid) {
			return;
		}

		createMutation.mutate({
			body: { author_name: trimmedAuthorName, content: trimmedContent },
			path: { profile_id: profileId },
		});
	};

	return (
		<form onSubmit={submit}>
			<Flex direction="column" gap={3}>
				<TextInput
					errorMessage={authorNameInvalid ? "Введите имя автора" : undefined}
					label="Ваше имя"
					onUpdate={value => {
						setAuthorName(value);
						if (value.trim()) setAuthorNameInvalid(false);
					}}
					validationState={authorNameInvalid ? "invalid" : undefined}
					value={authorName}
				/>
				<Flex direction="column" gap={1}>
					<Text color="secondary" variant="caption-2">
						Текст комментария
					</Text>
					<TextArea
						errorMessage={contentInvalid ? "Введите текст комментария" : undefined}
						minRows={3}
						onUpdate={value => {
							setContent(value);
							if (value.trim()) setContentInvalid(false);
						}}
						placeholder="Расскажите об этой анкете"
						validationState={contentInvalid ? "invalid" : undefined}
						value={content}
					/>
				</Flex>
				<Button loading={createMutation.isPending} type="submit" view="action">
					Добавить комментарий
				</Button>
			</Flex>
		</form>
	);
};

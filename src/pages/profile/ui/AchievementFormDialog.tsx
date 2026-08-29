import { Dialog, Flex, Text, TextArea, TextInput, useToaster } from "@gravity-ui/uikit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import type { AchievementApiRoutesAchievementAchievementGet } from "@/shared/api/achievement/types.gen";

import {
	createAchievementAchievementPostMutation,
	editAchievementAchievementIdPatchMutation,
	getAllAchievementsAchievementGetQueryKey,
	getAllAchievementsUserUserIdGetQueryKey,
} from "@/shared/api/achievement/@tanstack/react-query.gen";
import { useLoginData } from "@/shared/hooks";

import { getAchievementErrorMessage } from "../helpers";

interface AchievementFormDialogProps {
	achievement?: AchievementApiRoutesAchievementAchievementGet;
	onClose: () => void;
}

export const AchievementFormDialog = ({ achievement, onClose }: AchievementFormDialogProps) => {
	const { token, user_id } = useLoginData();
	const queryClient = useQueryClient();
	const toaster = useToaster();

	const [name, setName] = useState(achievement?.name ?? "");
	const [description, setDescription] = useState(achievement?.description ?? "");
	const [nameInvalid, setNameInvalid] = useState(false);

	const invalidateAchievements = () => {
		void queryClient.invalidateQueries({ queryKey: getAllAchievementsAchievementGetQueryKey() });
		void queryClient.invalidateQueries({
			queryKey: getAllAchievementsUserUserIdGetQueryKey({ path: { user_id: user_id ?? 0 } }),
		});
	};

	const toastDanger = (content: string) => {
		toaster.add({ content, name: "achievement-form-error", theme: "danger" });
	};

	const toastSuccess = (content: string) => {
		toaster.add({ content, name: "achievement-form-success", theme: "success" });
	};

	const createMutation = useMutation({
		...createAchievementAchievementPostMutation(),
		onError: error => {
			toastDanger(getAchievementErrorMessage(error));
		},
		onSuccess: () => {
			invalidateAchievements();
			toastSuccess("Достижение создано");
			onClose();
		},
	});

	const editMutation = useMutation({
		...editAchievementAchievementIdPatchMutation(),
		onError: error => {
			toastDanger(getAchievementErrorMessage(error));
		},
		onSuccess: () => {
			invalidateAchievements();
			toastSuccess("Достижение обновлено");
			onClose();
		},
	});

	const pending = createMutation.isPending || editMutation.isPending;

	const submit = () => {
		if (pending) {
			return;
		}

		const trimmedName = name.trim();

		if (!trimmedName) {
			setNameInvalid(true);
			return;
		}

		if (!token) {
			toastDanger("Требуется авторизация");
			return;
		}

		if (achievement) {
			editMutation.mutate({
				auth: token,
				body: { description: description.trim() || null, name: trimmedName },
				path: { id: achievement.id },
			});
		} else {
			createMutation.mutate({
				auth: token,
				body: { description: description.trim(), name: trimmedName },
			});
		}
	};

	return (
		<Dialog onClose={onClose} open size="m">
			<Dialog.Header caption={achievement ? "Изменить достижение" : "Новое достижение"} />
			<Dialog.Body>
				<form
					id="achievement-form"
					onSubmit={event => {
						event.preventDefault();
						submit();
					}}
				>
					<Flex direction="column" gap={3}>
						<TextInput
							errorMessage={nameInvalid ? "Введите название" : undefined}
							label="Название"
							onUpdate={value => {
								setName(value);
								if (value.trim()) setNameInvalid(false);
							}}
							validationState={nameInvalid ? "invalid" : undefined}
							value={name}
						/>
						<Flex direction="column" gap={1}>
							<Text color="secondary" variant="caption-2">
								Описание
							</Text>
							<TextArea minRows={3} onUpdate={setDescription} placeholder="Описание достижения" value={description} />
						</Flex>
					</Flex>
				</form>
			</Dialog.Body>
			<Dialog.Footer
				loading={pending}
				onClickButtonApply={submit}
				onClickButtonCancel={onClose}
				textButtonApply={achievement ? "Сохранить" : "Создать"}
				textButtonCancel="Отмена"
			/>
		</Dialog>
	);
};

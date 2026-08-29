import { Xmark } from "@gravity-ui/icons";
import { Dialog, FilePreview, Flex, Icon, useToaster } from "@gravity-ui/uikit";
import { unstable_FileDropZone as FileDropZone } from "@gravity-ui/uikit/unstable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
	getAllAchievementsAchievementGetQueryKey,
	getAllAchievementsUserUserIdGetQueryKey,
	uploadPictureAchievementIdPicturePatchMutation,
} from "@/shared/api/achievement/@tanstack/react-query.gen";
import { useLoginData } from "@/shared/hooks";

import { getAchievementErrorMessage } from "../helpers";

interface AchievementPictureDialogProps {
	achievementId: number;
	achievementName: string;
	onClose: () => void;
}

export const AchievementPictureDialog = ({
	achievementId,
	achievementName,
	onClose,
}: AchievementPictureDialogProps) => {
	const { token, user_id } = useLoginData();
	const queryClient = useQueryClient();
	const toaster = useToaster();

	const [file, setFile] = useState<File>();
	const [fileError, setFileError] = useState<string>();

	const uploadMutation = useMutation({
		...uploadPictureAchievementIdPicturePatchMutation(),
		onError: error => {
			toaster.add({
				content: getAchievementErrorMessage(error),
				name: "achievement-picture-error",
				theme: "danger",
			});
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: getAllAchievementsAchievementGetQueryKey() });
			void queryClient.invalidateQueries({
				queryKey: getAllAchievementsUserUserIdGetQueryKey({ path: { user_id: user_id ?? 0 } }),
			});
			toaster.add({
				content: "Картинка загружена",
				name: "achievement-picture-success",
				theme: "success",
			});
			onClose();
		},
	});

	const closeDialog = () => {
		setFile(undefined);
		setFileError(undefined);
		onClose();
	};

	const selectFile = (files: File[]) => {
		const selectedFile = files[0];

		if (!selectedFile || selectedFile.size === 0 || !selectedFile.type.startsWith("image/")) {
			setFileError("Выберите непустой файл изображения.");
			return;
		}

		setFile(selectedFile);
		setFileError(undefined);
	};

	const upload = () => {
		if (!token) {
			toaster.add({
				content: "Требуется авторизация",
				name: "achievement-picture-error",
				theme: "danger",
			});
			return;
		}

		if (!file || file.size === 0 || !file.type.startsWith("image/")) {
			setFileError("Выберите непустой файл изображения.");
			return;
		}

		uploadMutation.mutate({ auth: token, body: { picture_file: file }, path: { id: achievementId } });
	};

	return (
		<Dialog onClose={closeDialog} open size="m">
			<Dialog.Header caption={`Картинка: ${achievementName ?? `достижение №${achievementId}`}`} />
			<Dialog.Body>
				<Flex direction="column" gap={3}>
					<FileDropZone
						accept={["image/*"]}
						buttonText="Выбрать изображение"
						description="Картинка обновится сразу после загрузки"
						disabled={uploadMutation.isPending}
						errorMessage={fileError}
						onUpdate={(acceptedFiles, rejectedFiles) => {
							if (rejectedFiles.length > 0) {
								setFileError("Поддерживаются только изображения.");
								return;
							}
							selectFile(acceptedFiles);
						}}
						title="Перетащите картинку сюда"
						validationState={fileError ? "invalid" : undefined}
					/>
					{file && (
						<FilePreview
							actions={[
								{
									icon: <Icon data={Xmark} size={14} />,
									onClick: () => setFile(undefined),
									title: "Убрать файл",
								},
							]}
							file={file}
						/>
					)}
				</Flex>
			</Dialog.Body>
			<Dialog.Footer
				loading={uploadMutation.isPending}
				onClickButtonApply={upload}
				onClickButtonCancel={closeDialog}
				textButtonApply="Загрузить"
				textButtonCancel="Отмена"
			/>
		</Dialog>
	);
};

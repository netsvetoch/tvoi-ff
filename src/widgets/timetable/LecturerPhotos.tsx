import type { FormEvent } from "react";

import { Avatar, Button, FilePreview, Flex, Skeleton, Text, useToaster } from "@gravity-ui/uikit";
import { unstable_FileDropZone as FileDropZone } from "@gravity-ui/uikit/unstable";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import {
	getLecturerPhotosLecturerLecturerIdPhotoGetOptions,
	uploadPhotoLecturerLecturerIdPhotoPostMutation,
} from "@/shared/api/timetable/@tanstack/react-query.gen";
import { client } from "@/shared/api/timetable/client.gen";
import { resolveTimetablePhotoUrl } from "@/shared/helpers";
import { useLoginData } from "@/shared/hooks";

import styles from "./LecturerPhotos.module.css";

interface LecturerPhotosProps {
	lecturerId: number;
	lecturerName: string;
}

export const LecturerPhotos = ({ lecturerId, lecturerName }: LecturerPhotosProps) => {
	const navigate = useNavigate();
	const toaster = useToaster();
	const { token } = useLoginData();
	const [file, setFile] = useState<File>();
	const [fileError, setFileError] = useState<string>();
	const [brokenUrls, setBrokenUrls] = useState<Set<string>>(() => new Set());
	const photosQuery = useQuery(
		getLecturerPhotosLecturerLecturerIdPhotoGetOptions({
			path: { lecturer_id: lecturerId },
			query: { limit: 100 },
		})
	);
	const baseUrl = client.getConfig().baseUrl;
	const photoUrls = (photosQuery.data?.items ?? [])
		.map(link => resolveTimetablePhotoUrl(link, baseUrl))
		.filter((link): link is string => typeof link === "string" && !brokenUrls.has(link));
	const uploadMutation = useMutation({
		...uploadPhotoLecturerLecturerIdPhotoPostMutation(),
		onError: () => {
			toaster.add({
				content: "Не удалось загрузить фотографию. Попробуйте ещё раз.",
				name: "lecturer-photo-error",
				theme: "danger",
			});
		},
		onSuccess: () => {
			setFile(undefined);
			toaster.add({
				content: "Фотография отправлена и появится после модерации.",
				name: "lecturer-photo-success",
				theme: "success",
			});
		},
	});

	const selectFile = (files: File[]) => {
		const selectedFile = files[0];

		if (!selectedFile || selectedFile.size === 0 || !selectedFile.type.startsWith("image/")) {
			setFileError("Выберите непустой файл изображения.");
			return;
		}

		setFile(selectedFile);
		setFileError(undefined);
	};

	const uploadPhoto = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!token) {
			navigate({ to: "/login" });
			return;
		}

		if (!file || file.size === 0 || !file.type.startsWith("image/")) {
			setFileError("Выберите непустой файл изображения.");
			return;
		}

		uploadMutation.mutate({ auth: token, body: { photo: file }, path: { lecturer_id: lecturerId } });
	};

	return (
		<section aria-labelledby="lecturer-photos-title" className={styles.section}>
			<Flex direction="column" gap={3}>
				<Text as="h2" id="lecturer-photos-title" variant="header-2">
					Фотографии
				</Text>
				{photosQuery.isLoading && (
					<div className={styles.gallery}>
						<Skeleton className={styles.skeleton} />
						<Skeleton className={styles.skeleton} />
					</div>
				)}
				{!photosQuery.isLoading && photoUrls.length === 0 && (
					<Flex alignItems="flex-start" direction="column" gap={2}>
						<Avatar className={styles.fallback} text={lecturerName || "?"} />
						<Text color="secondary">
							{photosQuery.isError ? "Не удалось загрузить фотографии." : "Одобренных фотографий пока нет."}
						</Text>
						{photosQuery.isError && (
							<Button onClick={() => void photosQuery.refetch()} view="outlined">
								Повторить
							</Button>
						)}
					</Flex>
				)}
				{photoUrls.length > 0 && (
					<div className={styles.gallery}>
						{photoUrls.map((url, index) => (
							<img
								alt={`Фотография преподавателя ${lecturerName}, ${index + 1}`}
								className={styles.photo}
								height={240}
								key={url}
								loading="lazy"
								onError={() => setBrokenUrls(current => new Set(current).add(url))}
								src={url}
								width={240}
							/>
						))}
					</div>
				)}
				<div className={styles.upload}>
					{token ? (
						<form onSubmit={uploadPhoto}>
							<Flex direction="column" gap={3}>
								<Text variant="subheader-1">Предложить фотографию</Text>
								<FileDropZone
									accept={["image/*"]}
									buttonText="Выбрать изображение"
									description="Фотография появится после модерации"
									disabled={uploadMutation.isPending}
									errorMessage={fileError}
									onUpdate={(acceptedFiles, rejectedFiles) => {
										if (rejectedFiles.length > 0) {
											setFileError("Поддерживаются только изображения.");
											return;
										}
										selectFile(acceptedFiles);
									}}
									title="Перетащите фотографию сюда"
									validationState={fileError ? "invalid" : undefined}
								/>
								{file && <FilePreview file={file} />}
								<Button loading={uploadMutation.isPending} type="submit" view="action">
									Отправить на модерацию
								</Button>
							</Flex>
						</form>
					) : (
						<Flex alignItems="flex-start" direction="column" gap={2}>
							<Text color="secondary">Войдите, чтобы предложить фотографию.</Text>
							<Button onClick={() => navigate({ to: "/login" })} view="outlined-action">
								Войти
							</Button>
						</Flex>
					)}
				</div>
			</Flex>
		</section>
	);
};

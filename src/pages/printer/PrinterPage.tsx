import { TrashBin } from "@gravity-ui/icons";
import { Button, Checkbox, FilePreview, Flex, Text, TextInput, useToaster } from "@gravity-ui/uikit";
import { unstable_FileDropZone as FileDropZone } from "@gravity-ui/uikit/unstable";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import type { SendFilePostError, UploadFileFilePinPostError } from "@/shared/api/print";

import { sendFilePostMutation, uploadFileFilePinPostMutation } from "@/shared/api/print/@tanstack/react-query.gen";
import { useLoginData } from "@/shared/hooks";
import { PageHeader } from "@/shared/ui";

import { getPrinterLoginData } from "./helpers";

interface PrinterPageForm {
	copies: number;
	pages: string;
	two_sided: boolean;
}

const MAX_FILE_SIZE = 5_000_000;

const errorToText = (error: SendFilePostError | UploadFileFilePinPostError) =>
	typeof error === "object" && error !== null && "ru" in error && typeof error.ru === "string"
		? error.ru
		: "Неизвестная ошибка";

export const PrinterPage = () => {
	const navigate = useNavigate();
	const toaster = useToaster();
	const { token } = useLoginData();

	const [file, setFile] = useState<File>();
	const [fileError, setFileError] = useState<string>();
	const [pin, setPin] = useState<string>();

	const {
		control,
		formState: { errors },
		handleSubmit,
		register,
		reset,
	} = useForm<PrinterPageForm>({
		defaultValues: { copies: 1, pages: "", two_sided: false },
	});

	const sendMutation = useMutation({
		...sendFilePostMutation(),
		onError: error => {
			toaster.add({
				content: errorToText(error),
				name: "printer-send-error",
				theme: "danger",
			});
		},
	});

	const uploadMutation = useMutation({
		...uploadFileFilePinPostMutation(),
		onError: error => {
			toaster.add({
				content: errorToText(error),
				name: "printer-upload-error",
				theme: "danger",
			});
		},
	});

	const isPending = sendMutation.isPending || uploadMutation.isPending;

	const selectFile = (files: File[]) => {
		const selectedFile = files[0];

		if (!selectedFile) {
			return;
		}

		if (selectedFile.size === 0) {
			setFileError("Выберите непустой файл.");
			return;
		}

		if (selectedFile.size > MAX_FILE_SIZE) {
			setFileError("Файл должен быть не больше 5 МБ.");
			return;
		}

		setFile(selectedFile);
		setFileError(undefined);
	};

	const sendFile = async (data: PrinterPageForm, selectedFile: File, surname: string, number: string) => {
		const { pin } = await sendMutation.mutateAsync({
			auth: token,
			body: {
				filename: selectedFile.name,
				number,
				options: {
					copies: data.copies,
					pages: data.pages.trim() || undefined,
					two_sided: data.two_sided,
				},
				source: "tvoi-ff",
				surname,
			},
		});

		await uploadMutation.mutateAsync({
			body: { file: selectedFile },
			path: { pin },
		});

		return pin;
	};

	const onSubmit = async (data: PrinterPageForm) => {
		if (!token) {
			navigate({ to: "/login" });
			return;
		}

		if (!file || file.size === 0) {
			setFileError("Выберите файл для печати.");
			return;
		}

		const printerLoginData = await getPrinterLoginData();

		if (!printerLoginData?.number || !printerLoginData.surname) {
			navigate({ to: "/printer/login" });
			return;
		}

		try {
			const newPin = await sendFile(data, file, printerLoginData.surname, printerLoginData.number);
			setFile(undefined);
			setPin(newPin);
		} catch {
			// noop
		}
	};

	const resetAll = () => {
		setPin(undefined);
		setFile(undefined);
		setFileError(undefined);
		reset({ copies: 1, pages: "", two_sided: false });
	};

	return (
		<>
			<PageHeader breadcrumbs={[{ href: "/printer", label: "Принтер" }]} />
			<div style={{ margin: "auto", width: "clamp(200px, 100%, 600px)" }}>
				{pin ? (
					<Flex alignItems="center" direction="column" gap={4}>
						<Text variant="header-2">Файл отправлен на печать</Text>
						<Text color="secondary">Введите этот код на терминале печати:</Text>
						<Text style={{ fontSize: 48, letterSpacing: 8 }} variant="header-1">
							{pin}
						</Text>
						<Text color="secondary">Код действует 7 дней с момента загрузки.</Text>
						<Button onClick={resetAll} size="l" view="action">
							Отправить ещё один файл
						</Button>
					</Flex>
				) : (
					<form onSubmit={handleSubmit(onSubmit)}>
						<Flex direction="column" gap={3}>
							<FileDropZone
								accept={["application/pdf"]}
								buttonText="Выбрать файл"
								description="PDF до 5 МБ. После отправки вы получите код для терминала печати."
								disabled={isPending}
								errorMessage={fileError}
								onUpdate={(acceptedFiles, rejectedFiles) => {
									if (rejectedFiles.length > 0) {
										setFileError("Поддерживаются только PDF-файлы.");
										return;
									}
									selectFile(acceptedFiles);
								}}
								title="Перетащите файл сюда"
								validationState={fileError ? "invalid" : undefined}
							/>
							{file && (
								<FilePreview
									actions={[
										{
											icon: <TrashBin />,
											onClick: () => {
												setFile(undefined);
												setFileError(undefined);
											},
											title: "Убрать файл",
										},
									]}
									file={file}
								/>
							)}
							<TextInput label="Страницы" placeholder="Например: 1-3, 5. Пусто — все страницы" {...register("pages")} />
							<TextInput
								errorMessage="Укажите хотя бы одну копию"
								label="Количество копий"
								{...register("copies", { min: 1, required: true, valueAsNumber: true })}
								type="number"
								validationState={errors.copies ? "invalid" : undefined}
							/>
							<Controller
								control={control}
								name="two_sided"
								render={({ field }) => (
									<Checkbox checked={field.value} content="Печать с двух сторон" onUpdate={field.onChange} />
								)}
							/>
							<Button disabled={!file} loading={isPending} size="l" type="submit" view="action">
								Отправить на печать
							</Button>
						</Flex>
					</form>
				)}
			</div>
		</>
	);
};

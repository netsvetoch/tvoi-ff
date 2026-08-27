import { Alert, Button, Flex, TextInput, useToaster } from "@gravity-ui/uikit";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

import type { CheckUnionMemberIsUnionMemberGetData } from "@/shared/api/print";

import { updateUserUserIdPostMutation } from "@/shared/api/userdata/@tanstack/react-query.gen";
import { useLoginData } from "@/shared/hooks";
import { PageHeader } from "@/shared/ui/PageHeader";

import { getIsUnionMember } from "./helpers";
export type PrinterLoginPageForm = CheckUnionMemberIsUnionMemberGetData["query"];

export const PrinterLoginPage = () => {
	const toaster = useToaster();
	const { token, user_id } = useLoginData();
	const navigate = useNavigate();

	const { handleSubmit, register } = useForm<PrinterLoginPageForm>({
		defaultValues: { number: "", surname: "" },
	});

	const { mutateAsync: updateUser } = useMutation({
		...updateUserUserIdPostMutation(),
		onError: error => {
			// @ts-expect-error - error.message is not typed
			if (/object param (фамилия|номер профсоюзного билета) not found/i.test(error.message)) {
				toaster.add({
					content: "Проверьте введенные данные",
					name: "no-union-member",
					theme: "danger",
				});
			}
		},
	});

	const onSubmit = async (data: PrinterLoginPageForm) => {
		const isMember = await getIsUnionMember(data);

		if (!isMember) {
			toaster.add({
				content: "Проверьте введенные данные",
				name: "no-union-member",
				theme: "danger",
			});
			return;
		}

		try {
			await updateUser({
				auth: token,
				body: {
					items: [
						{ category: "Личная информация", param: "Фамилия", value: data.surname },
						{
							category: "Учёба",
							param: "Номер профсоюзного билета",
							value: data.number,
						},
					],
					source: "user",
				},
				path: {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					id: user_id!,
				},
			});
		} catch {
			return;
		}

		navigate({ replace: true, to: "/printer" });
	};

	return (
		<>
			<PageHeader breadcrumbs={[{ href: "/printer", label: "Принтер" }]} />
			<form onSubmit={handleSubmit(onSubmit)} style={{ margin: "auto", width: "clamp(200px, 100%, 600px)" }}>
				<Flex direction="column" gap={3}>
					<Alert
						message="Укажите фамилию и номер профсоюзного билета. После проверки данные сохранятся в профиле, и печать станет доступна."
						theme="info"
						title="Печать доступна только членам профсоюза"
					/>
					<TextInput {...register("surname")} label="Фамилия" placeholder="Иванов" size="xl" />
					<TextInput {...register("number")} label="Номер профсоюзного билета" placeholder="1012000" size="xl" />
					<Button size="xl" type="submit" view="action">
						Отправить
					</Button>
				</Flex>
			</form>
		</>
	);
};

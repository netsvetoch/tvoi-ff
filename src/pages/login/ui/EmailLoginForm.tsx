import { Button, Flex, PasswordInput, spacing, TextInput, useToaster } from "@gravity-ui/uikit";
import { useLocalStorage } from "@reactuses/core";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import type { AuthBackendAuthMethodSessionSession } from "@/shared/api/auth";

import {
	loginEmailLoginPostMutation,
	registerEmailRegistrationPostMutation,
} from "@/shared/api/auth/@tanstack/react-query.gen";

import { ResetPasswordModal } from "./ResetPasswordModal";

interface LoginForm {
	email: string;
	password: string;
}

export const EmailLoginForm = () => {
	const toaster = useToaster();
	const navigate = useNavigate();

	const { getValues, handleSubmit, register } = useForm<LoginForm>({
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const [, setLoginData] = useLocalStorage<AuthBackendAuthMethodSessionSession | undefined>("login_data", undefined);

	const { mutate: registerEmail } = useMutation({
		...registerEmailRegistrationPostMutation(),
		onError: error =>
			toaster.add({
				content: "ru" in error ? (error.ru as string) : "Неизвестная ошибка",
				name: "register-email-error",
				theme: "danger",
			}),
		onSuccess: data => {
			toaster.add({
				actions: [
					{
						label: "Войти",
						onClick: () => loginEmail({ body: { ...getValues() } }),
					},
				],
				autoHiding: false,
				content: `${data.ru}. После смены пароля можете войти.`,
				name: "register-email-success",
				theme: "utility",
			});
		},
	});

	const { mutate: loginEmail } = useMutation({
		...loginEmailLoginPostMutation(),
		onError: error => {
			// @ts-expect-error в автосгенерированных типах нет нормальных ошибок
			if (error.message === "Incorrect login or password") {
				toaster.add({
					actions: [
						{
							label: "Зарегистрироваться",
							onClick: () => registerEmail({ body: getValues() }),
						},
					],
					autoHiding: false,
					content: "Неверный Email / Пароль. Зарегистрироваться?",
					name: "login-email-error",
					theme: "utility",
				});
			} else {
				toaster.add({
					content: "ru" in error ? (error.ru as string) : "Неизвестная ошибка",
					name: "login-email-error",
					theme: "danger",
				});
			}
		},
		onSuccess: data => {
			toaster.removeAll();
			toaster.add({
				content: "Вход выполнен успешно",
				name: "login-email-success",
				theme: "success",
			});
			setLoginData(data);
			navigate("/profile");
		},
	});

	const onSubmit = async (data: LoginForm) => {
		loginEmail({ body: { ...data, scopes: ["auth.user.selfdelete"] } });
	};

	const [isRestorePasswordModalVisible, setIsRestorePasswordModalVisible] = useState(false);

	return (
		<>
			<form className={spacing({ p: 3 })} onSubmit={handleSubmit(onSubmit)}>
				<Flex direction="column" gap={3}>
					<TextInput {...register("email")} label="Email" size="xl" type="email" />
					<PasswordInput
						{...{ ...register("password"), ref: undefined }}
						controlRef={register("password").ref}
						label="Пароль"
						size="xl"
					/>
					<Button className={spacing({ mt: 4 })} size="xl" type="submit" view="action">
						Войти / Зарегистрироваться
					</Button>
					<Button
						className={spacing({ mt: 1 })}
						onClick={() => {
							setIsRestorePasswordModalVisible(true);
							toaster.remove("login-email-error");
						}}
						size="xl"
						type="button"
						view="outlined"
					>
						Восстановить пароль
					</Button>
				</Flex>
			</form>
			<ResetPasswordModal
				email={getValues("email")}
				onClose={() => setIsRestorePasswordModalVisible(false)}
				open={isRestorePasswordModalVisible}
			/>
		</>
	);
};

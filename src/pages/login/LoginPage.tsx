import { Flex, useToaster } from "@gravity-ui/uikit";
import { useMount } from "ahooks";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useLocalStorage } from "usehooks-ts";

import { AuthButton } from "@/features/AuthButton";
import { AUTH_METHODS_LIST, AUTH_METHODS_MAP } from "@/features/lib";
import { capitalize } from "@/shared/helpers/capitalize";
import { PageHeader } from "@/shared/ui";

import { isAuthMethod } from "./helpers";
import { EmailLoginForm } from "./ui";

import type { AuthBackendAuthMethodSessionSession } from "@/shared/api/auth";

export const LoginPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();

	const method = useMemo(() => searchParams.get("method") ?? "", [searchParams]);

	const [, setLoginData] = useLocalStorage<AuthBackendAuthMethodSessionSession | undefined>("login_data", undefined);

	const toaster = useToaster();

	useMount(async () => {
		const result = searchParams.get("result");

		if (result === "success") {
			toaster.add({
				content: "Почта подтверждена",
				name: "approve-email-success",
				theme: "success",
			});
			setSearchParams({});
			return;
		}

		if (result === "error") {
			toaster.add({
				content: "Не удалось подтвердить почту",
				name: "approve-email-error",
				theme: "danger",
			});
			setSearchParams({});
			return;
		}

		const code = searchParams.get("code");
		const state = searchParams.get("state");

		if (!code || !state) {
			setSearchParams({});
			return;
		}

		if (!isAuthMethod(method)) {
			toaster.add({
				content: "Этот метод авторизации еще не поддержан",
				name: "method-not-supported",
				theme: "danger",
			});
			setSearchParams({});
			return;
		}

		const { login, register } = AUTH_METHODS_MAP[method];

		const { data, error: loginError } = await login({
			body: { code, scopes: [], state },
		});

		if (!loginError) {
			toaster.add({
				content: "Вход выполнен успешно",
				name: "login-email-success",
				theme: "success",
			});
			setLoginData(data);
			void navigate("/profile");

			return;
		}

		const errorDetail = loginError.detail?.find(({ msg }) => /^No users found for(.*)account$/.exec(msg));
		const errorMatch = errorDetail?.msg.match(/^No users found for(.*)account$/);

		const registerAction = async () => {
			if (!("id_token" in loginError)) {
				toaster.add({
					content: "Не удалось зарегистрироваться",
					name: "register-error",
					theme: "danger",
				});

				return;
			}

			const { data: registerData, error: registerError } = await register({
				body: { id_token: loginError.id_token as string },
			});
			if (registerError) {
				toaster.add({
					content: "Не удалось зарегистрироваться",
					name: "register-error",
					theme: "danger",
				});

				return;
			}

			toaster.add({
				content: "Регистрация выполнена успешно",
				name: "register-success",
				theme: "success",
			});

			setLoginData(registerData);
			void navigate("/profile");
		};

		if (errorMatch) {
			toaster.add({
				actions: [
					{
						label: "Зарегистрироваться",
						onClick: () => void registerAction(),
					},
				],
				autoHiding: false,
				content: `Нет пользователя с таким ${capitalize(errorMatch.at(1)?.trim() ?? "")} аккаунтом. Зарегистрироваться?`,
				name: "login-method-error",
				theme: "utility",
			});
			return;
		}

		toaster.add({
			content: "Не удалось войти",
			name: "login-method-error",
			theme: "danger",
		});
		setSearchParams({});
		return;
	});

	return (
		<>
			<PageHeader
				breadcrumbs={[
					{
						href: "/login",
						label: "Вход",
					},
				]}
			/>
			<div style={{ margin: "auto", width: "clamp(200px, 100%, 600px)" }}>
				<EmailLoginForm />
				<Flex gap={2} justifyContent="center" style={{ marginTop: 32 }} wrap>
					{AUTH_METHODS_LIST.map(authMethod => (
						<AuthButton key={authMethod} method={authMethod} size="l" style={{ width: 90 }} />
					))}
				</Flex>
			</div>
		</>
	);
};

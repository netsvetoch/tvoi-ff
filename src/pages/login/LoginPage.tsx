import { useToaster } from "@gravity-ui/uikit";
import { useMount } from "@reactuses/core";
import { useSearchParams } from "react-router";

import { PageHeader } from "@/shared/ui";

import { EmailLoginForm } from "./ui";

export const LoginPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();

	const toaster = useToaster();

	useMount(() => {
		const result = searchParams.get("result");

		if (result === "success") {
			toaster.add({
				content: "Почта подтверждена",
				name: "approve-email-success",
				theme: "success",
			});
		} else if (result === "error") {
			toaster.add({
				content: "Не удалось подтвердить почту",
				name: "approve-email-error",
				theme: "danger",
			});
		}

		setSearchParams({});
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
			</div>
		</>
	);
};

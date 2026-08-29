import { Button, Flex, Loader, Text } from "@gravity-ui/uikit";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

import { getServiceServiceButtonIdGetOptions } from "@/shared/api/services/@tanstack/react-query.gen";
import { parseTimetableEntityId } from "@/shared/helpers";
import { useLoginData } from "@/shared/hooks";
import { PageHeader } from "@/shared/ui";

import { canEmbedButton, getButtonUrl, getServicesErrorMessage } from "./helpers";
import styles from "./ServiceViewPage.module.css";

export const ServiceViewPage = () => {
	const { buttonId: rawButtonId } = useParams({ strict: false }) as { buttonId?: string };

	const buttonId = parseTimetableEntityId(rawButtonId);

	const { token } = useLoginData();

	const {
		data: button,
		error,
		isLoading,
	} = useQuery({
		...getServiceServiceButtonIdGetOptions({
			auth: token,
			path: { button_id: buttonId ?? 0 },
		}),
		enabled: buttonId !== undefined,
	});

	const embeddable = button ? canEmbedButton(button) : false;
	const url = button ? getButtonUrl(button) : undefined;

	return (
		<Flex direction="column" style={{ flex: 1, minHeight: 0 }} width="100%">
			<PageHeader
				breadcrumbs={[
					{ href: "/services", label: "Сервисы" },
					{ href: `/services/${buttonId ?? ""}`, label: button?.name ?? "…", loading: isLoading },
				]}
			/>
			{isLoading && (
				<Flex alignItems="center" justifyContent="center" style={{ flex: 1, minHeight: 0 }}>
					<Loader size="l" />
				</Flex>
			)}
			{!isLoading && error && (
				<Flex alignItems="center" justifyContent="center" style={{ flex: 1, minHeight: 0 }}>
					<Text color="danger">{getServicesErrorMessage(error)}</Text>
				</Flex>
			)}
			{!isLoading && !error && buttonId === undefined && (
				<Flex alignItems="center" justifyContent="center" style={{ flex: 1, minHeight: 0 }}>
					<Text color="secondary" variant="subheader-2">
						Сервис не найден
					</Text>
				</Flex>
			)}
			{!isLoading && !error && buttonId !== undefined && embeddable && button && (
				<iframe
					className={styles.frame}
					sandbox="allow-forms allow-popups allow-same-origin allow-scripts"
					src={url}
					title={button.name ?? "Сервис"}
				/>
			)}
			{!isLoading && !error && buttonId !== undefined && !embeddable && (
				<Flex alignItems="center" direction="column" gap={3} justifyContent="center" style={{ flex: 1, minHeight: 0 }}>
					<Text color="secondary" variant="subheader-2">
						Эту ссылку нельзя открыть внутри приложения
					</Text>
					{url && (
						<Button href={url} target="_blank" view="action">
							Открыть в новой вкладке
						</Button>
					)}
				</Flex>
			)}
		</Flex>
	);
};

import { Flex, Loader, Text } from "@gravity-ui/uikit";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { getCategoriesCategoryGetOptions } from "@/shared/api/services/@tanstack/react-query.gen";
import { client as servicesClient } from "@/shared/api/services/client.gen";
import { useLoginData } from "@/shared/hooks";
import { Container, PageHeader } from "@/shared/ui";

import { getServiceIconUrl, getServicesErrorMessage, openServiceButton } from "./helpers";
import styles from "./ServicesPage.module.css";
import { ServiceButton } from "./ui";

export const ServicesPage = () => {
	const navigate = useNavigate();

	const { token } = useLoginData();

	const {
		data: categories,
		error,
		isLoading,
	} = useQuery(getCategoriesCategoryGetOptions({ auth: token, query: { info: ["buttons"] } }));

	const visibleCategories = categories?.filter(category => category.buttons?.some(button => button.view !== "hidden"));

	return (
		<>
			<PageHeader breadcrumbs={[{ href: "/services", label: "Сервисы" }]} />
			<Container>
				<Flex direction="column" gap={4}>
					{isLoading && (
						<Flex alignItems="center" justifyContent="center" style={{ minHeight: 300 }}>
							<Loader size="l" />
						</Flex>
					)}
					{error && <Text color="danger">{getServicesErrorMessage(error)}</Text>}
					{!isLoading && !error && (visibleCategories?.length ?? 0) === 0 && (
						<Flex alignItems="center" justifyContent="center" style={{ minHeight: 300 }}>
							<Text color="secondary" variant="subheader-2">
								Сервисы не найдены
							</Text>
						</Flex>
					)}
					{visibleCategories?.map(category => (
						<Flex direction="column" gap={2} key={category.id}>
							{category.name && <Text variant="subheader-1">{category.name}</Text>}
							<div className={styles.grid}>
								{category.buttons
									?.filter(button => button.view !== "hidden")
									.map(button => (
										<ServiceButton
											button={button}
											iconUrl={getServiceIconUrl(button, servicesClient.getConfig().baseUrl)}
											key={button.id}
											onClick={button => openServiceButton(button, navigate)}
										/>
									))}
							</div>
						</Flex>
					))}
				</Flex>
			</Container>
		</>
	);
};

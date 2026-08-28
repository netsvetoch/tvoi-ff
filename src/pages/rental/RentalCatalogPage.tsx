import { Button, Flex, Loader, Text, useToaster } from "@gravity-ui/uikit";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import type { ItemTypeGet } from "@/shared/api/rental";

import {
	createRentalSessionRentalSessionsItemTypeIdPostMutation,
	getItemsTypesItemtypeGetOptions,
	getItemsTypesItemtypeGetQueryKey,
} from "@/shared/api/rental/@tanstack/react-query.gen";
import { useLoginData } from "@/shared/hooks";
import { Container, PageHeader } from "@/shared/ui";

import { getRentalErrorMessage } from "./helpers";
import styles from "./RentalCatalogPage.module.css";
import { ItemTypeCard } from "./ui";

export const RentalCatalogPage = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const toaster = useToaster();

	const { token } = useLoginData();

	const { data: itemTypes, isLoading } = useQuery(getItemsTypesItemtypeGetOptions());

	const reserveMutation = useMutation({
		...createRentalSessionRentalSessionsItemTypeIdPostMutation(),
		onError: error => {
			toaster.add({
				content: getRentalErrorMessage(error),
				name: "rental-reserve-error",
				theme: "danger",
			});
		},
		onSuccess: () => {
			toaster.add({
				actions: [
					{
						label: "Мои аренды",
						onClick: () => navigate({ to: "/rental/my" }),
					},
				],
				content: "Бронь создана.",
				name: "rental-reserve-success",
				theme: "success",
			});
			void queryClient.invalidateQueries({ queryKey: getItemsTypesItemtypeGetQueryKey() });
		},
	});

	const handleReserve = (itemType: ItemTypeGet) => {
		if (!token) {
			navigate({ to: "/login" });
			return;
		}

		reserveMutation.mutate({
			auth: token,
			path: { item_type_id: itemType.id },
		});
	};

	return (
		<>
			<PageHeader
				actions={
					token && (
						<Button onClick={() => navigate({ to: "/rental/my" })} view="outlined">
							Мои аренды
						</Button>
					)
				}
				breadcrumbs={[{ href: "/rental", label: "Прокат" }]}
			/>
			<Container>
				<Flex direction="column" gap={3}>
					{isLoading && (
						<Flex alignItems="center" justifyContent="center" style={{ minHeight: 300 }}>
							<Loader size="l" />
						</Flex>
					)}
					{!isLoading && (itemTypes?.length ?? 0) === 0 && (
						<Flex alignItems="center" justifyContent="center" style={{ minHeight: 300 }}>
							<Text color="secondary" variant="subheader-2">
								Каталог пуст
							</Text>
						</Flex>
					)}
					{!isLoading && (itemTypes?.length ?? 0) > 0 && (
						<div className={styles.grid}>
							{itemTypes?.map(itemType => (
								<ItemTypeCard
									itemType={itemType}
									key={itemType.id}
									onReserve={handleReserve}
									reserving={reserveMutation.isPending}
								/>
							))}
						</div>
					)}
				</Flex>
			</Container>
		</>
	);
};

import { Button, Card, Dialog, Flex, Loader, Select, spacing, Text, useToaster } from "@gravity-ui/uikit";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import type { RentStatus } from "@/shared/api/rental";

import {
	cancelRentalSessionRentalSessionsSessionIdCancelDeleteMutation,
	getItemsTypesItemtypeGetOptions,
	getMySessionsRentalSessionsUserMeGetOptions,
	getMySessionsRentalSessionsUserMeGetQueryKey,
	getUserStrikesStrikeUserUserIdGetOptions,
} from "@/shared/api/rental/@tanstack/react-query.gen";
import { useLoginData } from "@/shared/hooks";
import { Container, PageHeader } from "@/shared/ui";

import { formatRentalDateTime, getRentalErrorMessage, RENT_STATUS_OPTIONS, RENT_STATUS_QUERY_FLAGS } from "./helpers";
import { SessionCard, SessionDetailDialog } from "./ui";

export const RentalMyPage = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const toaster = useToaster();

	const { token, user_id } = useLoginData();

	const [statusFilter, setStatusFilter] = useState<RentStatus[]>([]);
	const [detailSessionId, setDetailSessionId] = useState<number>();
	const [cancelSessionId, setCancelSessionId] = useState<number>();

	const sessionsQueryParams = useMemo(() => {
		const query: Partial<Record<(typeof RENT_STATUS_QUERY_FLAGS)[RentStatus], boolean>> = {};

		for (const status of statusFilter) {
			query[RENT_STATUS_QUERY_FLAGS[status]] = true;
		}

		return { auth: token, query };
	}, [statusFilter, token]);

	const { data: sessions, isLoading: sessionsLoading } = useQuery({
		...getMySessionsRentalSessionsUserMeGetOptions(sessionsQueryParams),
		enabled: Boolean(token),
	});

	const { data: itemTypes } = useQuery(getItemsTypesItemtypeGetOptions());

	const { data: strikes, isLoading: strikesLoading } = useQuery({
		...getUserStrikesStrikeUserUserIdGetOptions({ auth: token, path: { user_id: user_id ?? 0 } }),
		enabled: Boolean(token && user_id),
	});

	const cancelMutation = useMutation({
		...cancelRentalSessionRentalSessionsSessionIdCancelDeleteMutation(),
		onError: error => {
			toaster.add({
				content: getRentalErrorMessage(error),
				name: "rental-cancel-error",
				theme: "danger",
			});
		},
		onSuccess: () => {
			setCancelSessionId(undefined);
			toaster.add({
				content: "Бронь отменена.",
				name: "rental-cancel-success",
				theme: "success",
			});
			void queryClient.invalidateQueries({ queryKey: getMySessionsRentalSessionsUserMeGetQueryKey() });
		},
	});

	const itemTypeNames = useMemo(() => {
		const names = new Map<number, string>();

		for (const itemType of itemTypes ?? []) {
			names.set(itemType.id, itemType.name);
		}

		return names;
	}, [itemTypes]);

	const sortedSessions = useMemo(() => {
		return (sessions ?? []).toSorted((a, b) => b.reservation_ts.localeCompare(a.reservation_ts));
	}, [sessions]);

	const detailSession = sortedSessions.find(session => session.id === detailSessionId);

	const renderSessions = () => {
		if (sessionsLoading) {
			return (
				<Flex alignItems="center" justifyContent="center" style={{ minHeight: 200 }}>
					<Loader size="l" />
				</Flex>
			);
		}

		if (sortedSessions.length === 0) {
			return (
				<Card>
					<Flex className={spacing({ p: 3 })}>
						<Text color="secondary">У вас пока нет броней.</Text>
					</Flex>
				</Card>
			);
		}

		return (
			<Flex direction="column" gap={2}>
				{sortedSessions.map(session => (
					<SessionCard
						itemTypeName={itemTypeNames.get(session.item_type_id)}
						key={session.id}
						onCancel={() => setCancelSessionId(session.id)}
						onShowDetails={() => setDetailSessionId(session.id)}
						session={session}
					/>
				))}
			</Flex>
		);
	};

	const renderStrikes = () => {
		if (strikesLoading) {
			return (
				<Flex alignItems="center" justifyContent="center" style={{ minHeight: 100 }}>
					<Loader size="l" />
				</Flex>
			);
		}

		if ((strikes?.length ?? 0) === 0) {
			return (
				<Card>
					<Flex className={spacing({ p: 3 })}>
						<Text color="secondary">Страйков нет.</Text>
					</Flex>
				</Card>
			);
		}

		return (
			<Flex direction="column" gap={2}>
				{strikes?.map(strike => (
					<Card key={strike.id}>
						<Flex className={spacing({ p: 3 })} direction="column" gap={1}>
							<Text>{strike.reason}</Text>
							<Text color="secondary">
								{formatRentalDateTime(strike.create_ts)}
								{strike.session_id == null ? "" : ` · Бронь №${strike.session_id}`}
							</Text>
						</Flex>
					</Card>
				))}
			</Flex>
		);
	};

	return (
		<>
			<PageHeader
				actions={
					<Button onClick={() => navigate({ to: "/rental" })} view="outlined">
						Каталог
					</Button>
				}
				breadcrumbs={[
					{ href: "/rental", label: "Прокат" },
					{ href: "/rental/my", label: "Мои аренды" },
				]}
			/>
			<Container>
				<Flex direction="column" gap={4}>
					<Flex direction="column" gap={3}>
						<Text variant="header-1">Мои брони</Text>
						<Flex style={{ maxWidth: 340 }}>
							<Select
								label="Статус"
								multiple
								onUpdate={value => setStatusFilter(value as RentStatus[])}
								options={RENT_STATUS_OPTIONS}
								value={statusFilter}
								width="max"
							/>
						</Flex>
						{renderSessions()}
					</Flex>

					<Flex direction="column" gap={3}>
						<Text variant="header-1">Страйки</Text>
						{renderStrikes()}
					</Flex>
				</Flex>
			</Container>

			<SessionDetailDialog
				itemTypeName={detailSession ? itemTypeNames.get(detailSession.item_type_id) : undefined}
				onClose={() => setDetailSessionId(undefined)}
				sessionId={detailSessionId}
			/>

			<Dialog onClose={() => setCancelSessionId(undefined)} open={cancelSessionId !== undefined} size="s">
				<Dialog.Header caption="Отменить бронь?" />
				<Dialog.Body>
					<Text>Бронь №{cancelSessionId} будет отменена. Это действие нельзя отменить.</Text>
				</Dialog.Body>
				<Dialog.Footer
					loading={cancelMutation.isPending}
					onClickButtonApply={() => {
						if (cancelSessionId !== undefined && token) {
							cancelMutation.mutate({ auth: token, path: { session_id: cancelSessionId } });
						}
					}}
					onClickButtonCancel={() => setCancelSessionId(undefined)}
					preset="danger"
					textButtonApply="Отменить бронь"
					textButtonCancel="Назад"
				/>
			</Dialog>
		</>
	);
};

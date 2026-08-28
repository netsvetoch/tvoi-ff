import { Button, Card, Flex, Label, spacing, Text } from "@gravity-ui/uikit";

import type { RentalSessionGet } from "@/shared/api/rental";

import { KeyValue } from "@/shared/ui/KeyValue";

import { formatRentalDateTime, RENT_STATUS_LABEL_THEMES, RENT_STATUS_LABELS } from "../helpers";

interface SessionCardProps {
	itemTypeName: string | undefined;
	onCancel: () => void;
	onShowDetails: () => void;
	session: RentalSessionGet;
}

export const SessionCard = ({ itemTypeName, onCancel, onShowDetails, session }: SessionCardProps) => {
	return (
		<Card>
			<Flex className={spacing({ p: 3 })} direction="column" gap={2}>
				<Flex alignItems="center" gap={2} justifyContent="space-between">
					<Text variant="subheader-2">{itemTypeName ?? `Тип №${session.item_type_id}`}</Text>
					<Label theme={RENT_STATUS_LABEL_THEMES[session.status]}>{RENT_STATUS_LABELS[session.status]}</Label>
				</Flex>
				<Flex direction="column" gap={1}>
					<KeyValue title="Зарезервирована" value={formatRentalDateTime(session.reservation_ts)} />
					<KeyValue title="Начало" value={formatRentalDateTime(session.start_ts)} />
					<KeyValue title="Дедлайн" value={formatRentalDateTime(session.deadline_ts)} />
					<KeyValue title="Окончание" value={formatRentalDateTime(session.end_ts)} />
					<KeyValue title="Фактический возврат" value={formatRentalDateTime(session.actual_return_ts)} />
				</Flex>
				<Flex gap={2} justifyContent="flex-end">
					<Button onClick={onShowDetails} size="s" view="outlined">
						Подробнее
					</Button>
					{session.status === "reserved" && (
						<Button onClick={onCancel} size="s" view="outlined-danger">
							Отменить бронь
						</Button>
					)}
				</Flex>
			</Flex>
		</Card>
	);
};

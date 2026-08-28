import { Dialog, Flex, Label, Loader, Text } from "@gravity-ui/uikit";
import { useQuery } from "@tanstack/react-query";

import { getRentalSessionRentalSessionsSessionIdGetOptions } from "@/shared/api/rental/@tanstack/react-query.gen";
import { useLoginData } from "@/shared/hooks";
import { KeyValue } from "@/shared/ui/KeyValue";

import { formatRentalDateTime, RENT_STATUS_LABEL_THEMES, RENT_STATUS_LABELS } from "../helpers";

interface SessionDetailDialogProps {
	itemTypeName: string | undefined;
	onClose: () => void;
	sessionId?: number;
}

export const SessionDetailDialog = ({ itemTypeName, onClose, sessionId }: SessionDetailDialogProps) => {
	const { token } = useLoginData();

	const { data: session, isLoading } = useQuery({
		...getRentalSessionRentalSessionsSessionIdGetOptions({
			auth: token,
			path: { session_id: sessionId ?? 0 },
		}),
		enabled: Boolean(token && sessionId),
	});

	return (
		<Dialog onClose={onClose} open={sessionId !== undefined} size="m">
			<Dialog.Header caption={`Бронь №${sessionId}`} />
			<Dialog.Body>
				{isLoading || !session ? (
					<Flex alignItems="center" justifyContent="center" style={{ minHeight: 120 }}>
						<Loader size="l" />
					</Flex>
				) : (
					<Flex direction="column" gap={2}>
						<KeyValue
							title="Статус"
							value={
								<Label theme={RENT_STATUS_LABEL_THEMES[session.status]}>{RENT_STATUS_LABELS[session.status]}</Label>
							}
						/>
						<KeyValue title="Тип предмета" value={itemTypeName ?? `№${session.item_type_id}`} />
						<KeyValue title="Предмет" value={`№${session.item_id}`} />
						<KeyValue title="Зарезервирована" value={formatRentalDateTime(session.reservation_ts)} />
						<KeyValue title="Начало" value={formatRentalDateTime(session.start_ts)} />
						<KeyValue title="Дедлайн" value={formatRentalDateTime(session.deadline_ts)} />
						<KeyValue title="Окончание" value={formatRentalDateTime(session.end_ts)} />
						<KeyValue title="Фактический возврат" value={formatRentalDateTime(session.actual_return_ts)} />
						<KeyValue
							title="Выдал"
							value={session.admin_open_id === null ? "—" : `Администратор №${session.admin_open_id}`}
						/>
						<KeyValue
							title="Принял"
							value={session.admin_close_id === null ? "—" : `Администратор №${session.admin_close_id}`}
						/>
						<KeyValue title="Страйк" value={session.strike_id == null ? "Нет" : `№${session.strike_id}`} />
						{session.user_fullname && <KeyValue title="Имя" value={session.user_fullname} />}
						{session.user_phone && <KeyValue title="Телефон" value={session.user_phone} />}
					</Flex>
				)}
				{sessionId !== undefined && !isLoading && !session && (
					<Text color="secondary">Не удалось загрузить бронь.</Text>
				)}
			</Dialog.Body>
			<Dialog.Footer
				onClickButtonApply={onClose}
				onClickButtonCancel={onClose}
				textButtonApply="Закрыть"
				textButtonCancel="Отмена"
			/>
		</Dialog>
	);
};

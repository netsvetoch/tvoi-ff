import { dateTime } from "@gravity-ui/date-utils";

import type { RentStatus } from "@/shared/api/rental";

type FastApiDetail = { detail?: Array<{ msg?: string }> | string };

export const getRentalErrorMessage = (error: unknown): string => {
	if (typeof error === "string" && error) {
		return error;
	}

	if (error && typeof error === "object" && "ru" in error && typeof error.ru === "string") {
		return error.ru;
	}

	if (error && typeof error === "object" && "detail" in error) {
		const { detail } = error as FastApiDetail;

		if (typeof detail === "string" && detail) {
			return detail;
		}

		if (Array.isArray(detail)) {
			const messages = detail.map(item => item?.msg).filter(Boolean);

			if (messages.length > 0) {
				return messages.join("; ");
			}
		}
	}

	return "Неизвестная ошибка";
};

export const RENT_STATUS_LABELS: Record<RentStatus, string> = {
	active: "Активна",
	canceled: "Отменена",
	dismissed: "Отклонена",
	expired: "Истекла",
	overdue: "Просрочена",
	reserved: "Зарезервирована",
	returned: "Возвращена",
};

export const RENT_STATUS_LABEL_THEMES: Record<
	RentStatus,
	"clear" | "danger" | "info" | "success" | "unknown" | "warning"
> = {
	active: "success",
	canceled: "unknown",
	dismissed: "warning",
	expired: "danger",
	overdue: "danger",
	reserved: "info",
	returned: "clear",
};

export const RENT_STATUS_OPTIONS = (Object.keys(RENT_STATUS_LABELS) as RentStatus[]).map(status => ({
	content: RENT_STATUS_LABELS[status],
	value: status,
}));

export const RENT_STATUS_QUERY_FLAGS: Record<RentStatus, string> = {
	active: "is_active",
	canceled: "is_canceled",
	dismissed: "is_dismissed",
	expired: "is_expired",
	overdue: "is_overdue",
	reserved: "is_reserved",
	returned: "is_returned",
};

export const formatRentalDateTime = (timestamp: null | string | undefined): string => {
	if (!timestamp) {
		return "—";
	}

	return dateTime({ input: timestamp }).format("DD.MM.YYYY HH:mm");
};

export const isCooldownActive = (timestamp: null | string | undefined): boolean => {
	if (!timestamp) {
		return false;
	}

	return dateTime({ input: timestamp }).valueOf() > Date.now();
};

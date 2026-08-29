type FastApiDetail = { detail?: Array<{ msg?: string }> | string };

export const getAchievementErrorMessage = (error: unknown): string => {
	if (typeof error === "string" && error) {
		return error;
	}

	if (error && typeof error === "object" && "ru" in error && typeof error.ru === "string") {
		return error.ru;
	}

	if (error && typeof error === "object" && "message" in error && typeof error.message === "string" && error.message) {
		return error.message;
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

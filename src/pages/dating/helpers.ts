import type { HttpValidationError } from "@/shared/api/dating/types.gen";

export const DATING_PAGE_SIZE = 12;

export const COMMENTS_PAGE_SIZE = 10;

export const GENDER_OPTIONS = ["женский", "мужской"].map(gender => ({ content: gender, value: gender }));

type FastApiDetail = HttpValidationError & { detail?: Array<{ msg?: string }> | string };

export const getDatingErrorMessage = (error: unknown): string => {
	if (typeof error === "string" && error) {
		return error;
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

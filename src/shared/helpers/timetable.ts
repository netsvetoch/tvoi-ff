import { dateTime } from "@gravity-ui/date-utils";

const DAYS_PARAM_VALUES = new Set<unknown>(["1", 1, "3", 3, "7", 7]);

export const parseTimetableDaysParam = (value: unknown): 1 | 3 | 7 | undefined => {
	if (DAYS_PARAM_VALUES.has(value)) {
		return Number(value) as 1 | 3 | 7;
	}

	return undefined;
};

export const parseTimetableDateParam = (value: null | string | undefined): string | undefined => {
	if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return undefined;
	}

	return dateTime({ input: value }).isValid() ? value : undefined;
};

export const parseTimetableEntityId = (value: null | string | undefined): number | undefined => {
	if (!value || !/^\d+$/.test(value)) {
		return undefined;
	}

	const id = Number(value);

	return Number.isSafeInteger(id) && id > 0 ? id : undefined;
};

export const resolveTimetablePhotoUrl = (
	link: null | string | undefined,
	baseUrl: string | undefined
): string | undefined => {
	if (!link) {
		return undefined;
	}

	let url: URL;
	const normalizedBaseUrl = baseUrl ? `${baseUrl.replace(/\/$/, "")}/` : undefined;

	try {
		url = new URL(link, normalizedBaseUrl);
	} catch {
		return undefined;
	}

	return url.protocol === "http:" || url.protocol === "https:" ? url.href : undefined;
};

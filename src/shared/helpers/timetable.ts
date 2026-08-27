export const parseTimetableEntityId = (value: null | string): number | undefined => {
	if (!value || !/^\d+$/.test(value)) {
		return undefined;
	}

	const id = Number(value);

	return Number.isSafeInteger(id) && id > 0 ? id : undefined;
};

export const updateTimetableFilter = (searchParams: URLSearchParams, key: string, value?: string) => {
	const nextSearchParams = new URLSearchParams(searchParams);

	if (value) {
		nextSearchParams.set(key, value);
	} else {
		nextSearchParams.delete(key);
	}

	return nextSearchParams;
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

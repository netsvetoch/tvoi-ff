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

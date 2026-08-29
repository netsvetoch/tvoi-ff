export const resolveServiceAssetUrl = (
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

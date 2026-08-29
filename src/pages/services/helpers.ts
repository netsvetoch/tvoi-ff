import type { useNavigate } from "@tanstack/react-router";

import type { ButtonGet } from "@/shared/api/services";

import { resolveServiceAssetUrl } from "@/shared/helpers";

export type NavigateFn = ReturnType<typeof useNavigate>;

export const getButtonUrl = (button: ButtonGet): string | undefined => resolveServiceAssetUrl(button.link, undefined);

export const getServiceIconUrl = (button: ButtonGet, baseUrl: string | undefined): string | undefined =>
	resolveServiceAssetUrl(button.icon, baseUrl);

export const canEmbedButton = (button: ButtonGet): boolean => {
	return button.type === "internal" && Boolean(getButtonUrl(button));
};

export const openServiceButton = (button: ButtonGet, navigate: NavigateFn): void => {
	if (button.view !== "active") {
		return;
	}

	if (button.type === "inapp") {
		if (button.link) {
			navigate({ href: button.link });
		}
		return;
	}

	if (button.type === "internal") {
		navigate({ params: { buttonId: String(button.id) }, to: "/services/$buttonId" });
		return;
	}

	const url = getButtonUrl(button);

	if (url) {
		window.open(url, "_blank", "noopener,noreferrer");
	}
};

type FastApiDetail = { detail?: Array<{ msg?: string }> | string };

export const getServicesErrorMessage = (error: unknown): string => {
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

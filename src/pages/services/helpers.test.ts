import { describe, expect, it, vi } from "vitest";

import type { ButtonGet } from "@/shared/api/services";

import type { NavigateFn } from "./helpers";

import { canEmbedButton, getButtonUrl, openServiceButton } from "./helpers";

const createButton = (overrides: Partial<ButtonGet> = {}): ButtonGet => ({
	icon: null,
	id: 1,
	link: "https://example.com/form",
	name: "Форма",
	optional_scopes: null,
	order: 1,
	required_scopes: null,
	scopes: null,
	type: "external",
	view: "active",
	...overrides,
});

const createNavigate = () => vi.fn() as unknown as NavigateFn & ReturnType<typeof vi.fn>;

const stubWindowOpen = () => {
	const open = vi.fn().mockReturnValue(null);
	vi.stubGlobal("window", { open });
	return open;
};

describe("getButtonUrl", () => {
	it("возвращает абсолютную http(s)-ссылку", () => {
		expect(getButtonUrl(createButton())).toBe("https://example.com/form");
	});

	it("отбрасывает не-http ссылку", () => {
		expect(getButtonUrl(createButton({ link: "javascript:alert(1)" }))).toBeUndefined();
	});

	it("возвращает undefined для пустой ссылки", () => {
		expect(getButtonUrl(createButton({ link: null }))).toBeUndefined();
	});
});

describe("canEmbedButton", () => {
	it("true для internal с валидной ссылкой", () => {
		expect(canEmbedButton(createButton({ type: "internal" }))).toBe(true);
	});

	it("false для не-internal", () => {
		expect(canEmbedButton(createButton({ type: "inapp" }))).toBe(false);
	});

	it("false для internal без валидной ссылки", () => {
		expect(canEmbedButton(createButton({ link: "/relative", type: "internal" }))).toBe(false);
	});
});

describe("openServiceButton", () => {
	it("неактивную кнопку не открывает", () => {
		const navigate = createNavigate();
		const open = stubWindowOpen();

		openServiceButton(createButton({ view: "blocked" }), navigate);

		expect(navigate).not.toHaveBeenCalled();
		expect(open).not.toHaveBeenCalled();
		vi.unstubAllGlobals();
	});

	it("inapp — навигация по ссылке-маршруту", () => {
		const navigate = createNavigate();

		openServiceButton(createButton({ link: "/printer", type: "inapp" }), navigate);

		expect(navigate).toHaveBeenCalledWith({ href: "/printer" });
	});

	it("internal — переход на страницу просмотра с id", () => {
		const navigate = createNavigate();

		openServiceButton(createButton({ id: 7, type: "internal" }), navigate);

		expect(navigate).toHaveBeenCalledWith({ params: { buttonId: "7" }, to: "/services/$buttonId" });
	});

	it("external — открытие в новой вкладке", () => {
		const navigate = createNavigate();
		const open = stubWindowOpen();

		openServiceButton(createButton(), navigate);

		expect(navigate).not.toHaveBeenCalled();
		expect(open).toHaveBeenCalledWith("https://example.com/form", "_blank", "noopener,noreferrer");
		vi.unstubAllGlobals();
	});

	it("external с невалидной ссылкой не открывает окно", () => {
		const navigate = createNavigate();
		const open = stubWindowOpen();

		openServiceButton(createButton({ link: "not a url" }), navigate);

		expect(open).not.toHaveBeenCalled();
		vi.unstubAllGlobals();
	});
});

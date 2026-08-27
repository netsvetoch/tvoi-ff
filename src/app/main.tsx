import { settings } from "@gravity-ui/date-utils";
import { ThemeProvider, Toaster, ToasterProvider } from "@gravity-ui/uikit";
import { useLocalStorage } from "@reactuses/core";
import "@gravity-ui/uikit/styles/fonts.css";
import "@gravity-ui/uikit/styles/styles.css";
import "@gravity-ui/illustrations/styles/styles.scss";

import "./index.css";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import { router } from "./router";

await settings.loadLocale("ru");
settings.setLocale("ru");

const root = document.querySelector("#root");

const toaster = new Toaster();

const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error, query) => {
			toaster.add({
				content: (query.meta?.errorMessage as string) ?? ("ru" in error ? (error.ru as string) : "Неизвестная ошибка"),
				name: "query-error",
				theme: "danger",
			});
		},
	}),
});

if (!root) {
	throw new Error("No root element found");
}

const Root = () => {
	const [theme] = useLocalStorage("theme", "system");

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider theme={theme ?? "system"}>
				<ToasterProvider toaster={toaster}>
					<RouterProvider router={router} />
				</ToasterProvider>
			</ThemeProvider>
		</QueryClientProvider>
	);
};

createRoot(root).render(<Root />);

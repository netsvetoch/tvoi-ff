import { useForm } from "react-hook-form";

import { PageHeader } from "@/shared/ui";

import type { SendInput } from "@/shared/api/print";

export const PrinterPage = () => {
	const { handleSubmit } = useForm<SendInput>({ defaultValues: {} });

	const onSubmit = (data: SendInput) => {
		// eslint-disable-next-line no-console
		console.log(data);
	};

	return (
		<>
			<PageHeader breadcrumbs={[{ href: "/printer", label: "Принтер" }]} />
			<div style={{ margin: "auto", width: "clamp(200px, 100%, 600px)" }}>
				<form onSubmit={event => void handleSubmit(onSubmit)(event)} />
			</div>
		</>
	);
};

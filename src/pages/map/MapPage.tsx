import { Flex, Select } from "@gravity-ui/uikit";
import { useNavigate, useParams } from "react-router";

import { Container, PageHeader } from "@/shared/ui";

import { LazyMap } from "./ui";

export const MapPage = () => {
	const navigate = useNavigate();

	const params = useParams();
	const floor = Number(params.floor);
	const { roomName } = params;

	return (
		<>
			<PageHeader
				breadcrumbs={[
					{ href: "/map", label: "Схема этажей" },
					{ href: `/map/${floor}`, label: `Этаж ${floor === 0 ? -1 : floor}` },
					{
						hide: !roomName,
						href: `/map/${floor}/${roomName}`,
						label: roomName,
					},
				]}
			/>
			<Container>
				<Flex direction="column" gap={2}>
					<Select
						onUpdate={([f]) => {
							void navigate(`/map/${f}`);
						}}
						options={[-1, 1, 2, 3, 4, 5].map(f => ({
							content: `Этаж ${f}`,
							value: f === -1 ? "0" : f.toString(),
						}))}
						size="xl"
						value={[floor.toString()]}
						width={128}
					/>
					<LazyMap />
				</Flex>
			</Container>
		</>
	);
};

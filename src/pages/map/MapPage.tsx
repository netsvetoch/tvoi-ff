import { Flex, Select } from "@gravity-ui/uikit";
import { useNavigate, useParams } from "@tanstack/react-router";

import { Container, PageHeader } from "@/shared/ui";

import { LazyMap } from "./ui";

export const MapPage = () => {
	const navigate = useNavigate();

	const { floor: floorParam, roomName } = useParams({ strict: false });
	const floor = Number(floorParam);

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
				<Flex direction={"column"} gap={2}>
					<Select
						onUpdate={([f]) => {
							navigate({ params: { floor: f }, to: "/map/$floor" });
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

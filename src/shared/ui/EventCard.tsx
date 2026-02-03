import { Card, Flex, spacing } from "@gravity-ui/uikit";
import { useMemo } from "react";
import { useNavigate } from "react-router";

import { getLecturerShortName } from "@/shared/helpers";
import { TextBox } from "@/shared/ui";

import type { Event } from "@/shared/api/timetable";

interface EventCardProps {
	event: Event;
	style: React.CSSProperties;
}

export const EventCard = ({ event, style }: EventCardProps) => {
	const navigate = useNavigate();

	const background = useMemo(() => {
		if (event.name === "ВОЕННАЯ ПОДГОТОВКА") {
			return "var(--g-color-base-generic)";
		}
		if (event.name === event.name.toUpperCase()) {
			return "var(--g-color-base-info-light)";
		}
		return "var(--g-color-base-utility-light)";
	}, [event.name]);

	return (
		<Card
			className={spacing({ p: 2 })}
			key={event.id}
			onClick={() => {
				void navigate(`/timetable/events/${event.id}`);
			}}
			style={{
				...style,
				background,
				position: "relative",
				zIndex: 2,
			}}
			type="selection"
		>
			<Flex direction="column" gap={1}>
				<TextBox lines={3} style={{ fontWeight: "bold" }} variant="caption-2">
					{event.name}
				</TextBox>
				<TextBox lines={3} variant="caption-2">
					{event.lecturer.map(getLecturerShortName).join(", ")}
				</TextBox>
				<TextBox lines={3} variant="caption-2">
					{event.room.map(r => r.name).join(", ")}
				</TextBox>
			</Flex>
		</Card>
	);
};

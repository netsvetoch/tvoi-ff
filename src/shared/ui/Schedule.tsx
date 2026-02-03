import { type DateTime, dateTime } from "@gravity-ui/date-utils";
import { ArrowLeft, ArrowRight } from "@gravity-ui/icons";
import { Button, Flex, Icon, Loader, Overlay, SegmentedRadioGroup, Text, TextInput } from "@gravity-ui/uikit";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "usehooks-ts";

import { findLcm, getEventsWithIntersections } from "../helpers";
import { assignOrders } from "../helpers/assignOrders";
import { EventCard } from "./EventCard";

import type { EventGet } from "../api/timetable";

export interface ScheduleProps {
	date: DateTime;
	events: EventGet[];
	hourEnd: number;
	hourStart: number;
	isLoading?: boolean;
	onDateUpdate: (date: DateTime) => void;
	onShowedWeekdaysUpdate: (weekdays: 1 | 3 | 7) => void;
	overlay?: ReactNode;
	period: { end: DateTime; start: DateTime };
	quantumTimeUnit: number;
	quantumTimeUnitHeight: number;
	showedWeekdays: 1 | 3 | 7;
}

export const Schedule = ({
	date,
	events,
	hourEnd,
	hourStart,
	isLoading = false,
	onDateUpdate,
	onShowedWeekdaysUpdate,
	overlay,
	period,
	quantumTimeUnit,
	quantumTimeUnitHeight,
	showedWeekdays,
}: ScheduleProps) => {
	const hoursCount = hourEnd - hourStart;
	const quantaInHour = 60 / quantumTimeUnit;

	const getDayStart = useCallback(
		(input: DateTime | string) => {
			return dateTime({ input }).set({
				hour: hourStart,
				millisecond: 0,
				minute: 0,
				second: 0,
			});
		},
		[hourStart]
	);
	const eventsWithIntersections = useMemo(() => assignOrders(getEventsWithIntersections(events)), [events]);

	const lcm = useMemo(
		() => findLcm(eventsWithIntersections.map(event => event.intersections)),
		[eventsWithIntersections]
	);

	const transformedEvents = useMemo(
		() =>
			eventsWithIntersections.map(event => {
				const d = dateTime({ input: event.start_ts });
				const dayStart = getDayStart(event.start_ts);
				const deltaStart = d.diff(dayStart, "minutes");
				const deltaEnd = dateTime({ input: event.end_ts }).diff(dayStart, "minutes");
				const gridRowStart = Math.round(deltaStart / quantumTimeUnit) + 1;
				const gridRowEnd = Math.round(deltaEnd / quantumTimeUnit) + 1;

				const columnWidth = lcm / event.intersections;
				const gridColumnStart = lcm * (d.day() - period.start.day()) + columnWidth * (event.order - 1) + 1;
				const gridColumnEnd = gridColumnStart + columnWidth;

				return {
					event,
					style: {
						gridColumnEnd,
						gridColumnStart,
						gridRowEnd,
						gridRowStart,
					},
				};
			}),
		[eventsWithIntersections, lcm, getDayStart, quantumTimeUnit, period.start]
	);

	const [currentOffset, setCurrentOffset] = useState(dateTime().diff(getDayStart(dateTime()), "minutes"));

	const isMobile = useMediaQuery("(max-width: 768px)");

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentOffset(dateTime().diff(getDayStart(dateTime()), "minutes"));
		}, 60e3);
		return () => {
			clearInterval(interval);
		};
	}, [getDayStart]);

	const translateX = useMemo(() => {
		switch (showedWeekdays) {
			case 1: {
				return `0`;
			}
			case 3: {
				return `calc(100cqw / 3)`;
			}
			case 7: {
				return `calc(100cqw / 7 * ${dateTime().weekday()})`;
			}
			default: {
				return `0`;
			}
		}
	}, [showedWeekdays]);

	const showNowLine = useMemo(() => {
		return (
			dateTime().hour() < hourEnd &&
			dateTime().hour() > hourStart &&
			date.format("YYYY-MM-DD") === dateTime().format("YYYY-MM-DD")
		);
	}, [hourEnd, hourStart, date]);

	return (
		<Flex direction="column">
			<Flex direction={isMobile ? "column" : "row"} gap={2} justifyContent="space-between">
				<Flex>
					<Button
						onClick={() => {
							onDateUpdate(date.subtract(showedWeekdays, "day"));
						}}
						pin="round-brick"
						size="xl"
						view="outlined"
					>
						<Icon data={ArrowLeft} />
					</Button>
					<TextInput
						pin="brick-brick"
						readOnly
						size="xl"
						value={
							showedWeekdays === 1
								? period.start.format("D MMMM")
								: `${period.start.format("D MMMM")} – ${period.end.format("D MMMM")}`
						}
					/>
					<Button
						onClick={() => {
							onDateUpdate(date.add(showedWeekdays, "day"));
						}}
						pin="brick-round"
						size="xl"
						view="outlined"
					>
						<Icon data={ArrowRight} />
					</Button>
				</Flex>
				<SegmentedRadioGroup
					onUpdate={value => {
						onShowedWeekdaysUpdate(Number(value) as 1 | 3 | 7);
					}}
					options={[
						{ content: "1 день", value: "1" },
						{ content: "3 дня", value: "3" },
						{ content: "7 дней", value: "7" },
					]}
					size="xl"
					value={showedWeekdays.toString()}
				/>
			</Flex>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: `50px repeat(${showedWeekdays}, minmax(0, 1fr))`,
					gridTemplateRows: `100px repeat(${hoursCount}, ${quantumTimeUnitHeight * quantaInHour}px)`,
				}}
			>
				{/* subgrid */}
				<div
					style={{
						containerType: "size",
						display: "grid",
						gridColumn: `2 / ${2 + showedWeekdays}`,
						gridRow: "2 / 12",
						gridTemplateColumns: `repeat(${lcm * showedWeekdays}, minmax(0, 1fr))`,
						gridTemplateRows: `repeat(${hoursCount * quantaInHour}, ${quantumTimeUnitHeight}px)`,
						position: "relative",
					}}
				>
					{transformedEvents.map(({ event, style }) => (
						<EventCard event={event} key={event.id} style={style} />
					))}

					{/* now line */}
					{showNowLine && (
						<div
							style={{
								background: "red",
								borderRadius: 999,
								height: 2,
								left: 0,
								position: "absolute",
								top: 0,
								transform: `translate(${translateX}, calc(100cqh / ${hoursCount} / 60 * ${currentOffset})`,
								width: `calc(100% / ${showedWeekdays})`,
								zIndex: 3,
							}}
						>
							<div
								style={{
									background: "red",
									borderRadius: 999,
									height: 12,
									left: -1,
									position: "absolute",
									top: -5,
									width: 12,
								}}
							/>
						</div>
					)}
					{/* grid lines */}
					{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
						<div
							key={i}
							style={{
								background: "var(--g-color-line-generic)",
								height: 1,
								left: 0,
								position: "absolute",
								right: 0,
								top: quantumTimeUnitHeight * quantaInHour * i,
							}}
						/>
					))}

					<Overlay visible={isLoading}>
						<Loader size="l" />
					</Overlay>
					<Overlay visible={!isLoading && Boolean(overlay)}>{overlay}</Overlay>
				</div>

				{/* header */}
				{Array.from({ length: showedWeekdays }, (_, i) => i).map(i => (
					<Flex
						alignItems="center"
						direction="column"
						gap={2}
						justifyContent="center"
						key={i}
						style={{
							gridColumn: i + 1 + 1,
							gridRow: 1,
						}}
					>
						<Text>{period.start.add(i, "day").format("dd").toUpperCase()}</Text>
						<Text variant="subheader-3">{period.start.add(i, "day").format("DD")}</Text>
					</Flex>
				))}
				{/* hours */}
				{Array.from({ length: hoursCount }, (_, i) => i).map(i => (
					<Flex
						key={i}
						style={{
							gridColumn: 1,
							gridRowEnd: i + 1 + 1 + 1,
							gridRowStart: i + 1 + 1,
						}}
					>
						<Text style={{ height: "fit-content", transform: "translateY(-50%)" }} variant="body-2">
							{i + 9}:00
						</Text>
					</Flex>
				))}
			</div>
		</Flex>
	);
};

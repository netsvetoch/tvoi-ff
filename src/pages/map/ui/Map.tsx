import { dateTime } from "@gravity-ui/date-utils";
import { Minus, Plus } from "@gravity-ui/icons";
import XmarkIcon from "@gravity-ui/icons/svgs/xmark.svg";
import { Button, Card, Flex, Icon } from "@gravity-ui/uikit";
import { useQuery } from "@tanstack/react-query";
import Konva from "konva";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image, Layer, Rect, Stage, Text } from "react-konva";
import { useNavigate, useParams } from "react-router";
import useImage from "use-image";
import { useResizeObserver } from "usehooks-ts";

import { getEventsEventGetOptions, getRoomsRoomGetOptions } from "@/shared/api/timetable/@tanstack/react-query.gen";

import { cursorPointer, floors } from "../constants";

const POPOVER_EVENTS_GAP = 4;
const POPOVER_PADDING_X = 4;
const POPOVER_PADDING_TOP = 8;
const POPOVER_PADDING_BOTTOM = 4;
const POPOVER_TITLE_FONT_SIZE = 8;
const POPOVER_TITLE_MARGIN = 4;
const POPOVER_EVENT_PADDING = 4;
const POPOVER_WIDTH = 90;
const POPOVER_MIN_HEIGHT = 90;
const POPOVER_EVENT_FONT_SIZE = 5;
const POPOVER_EVENT_HEIGHT = POPOVER_EVENT_FONT_SIZE * 3 + POPOVER_EVENT_PADDING * 2;
const POPOVER_OFFSET_X = -14;

interface Point {
	x: number;
	y: number;
}

Konva.hitOnDragEnabled = true;

const getCenter = (p1: Point, p2: Point) => {
	return {
		x: (p1.x + p2.x) / 2,
		y: (p1.y + p2.y) / 2,
	};
};

const getDistance = (p1: Point, p2: Point) => {
	return Math.hypot(p2.x - p1.x, p2.y - p1.y);
};

export const MapComponent = () => {
	const navigate = useNavigate();
	const ref = useRef<HTMLDivElement | null>(null);
	const stageRef = useRef<Konva.Stage | null>(null);
	const [xmark] = useImage(XmarkIcon);

	const params = useParams();
	const floor = Number(params.floor);
	const { roomName } = params;
	const selectedRoom = useMemo(() => floors[floor].find(room => room.name === roomName), [floor, roomName]);

	const { data: roomData } = useQuery({
		...getRoomsRoomGetOptions({ query: { limit: 1, query: roomName } }),
		enabled: Boolean(roomName),
	});

	const roomId = roomData?.items.at(0)?.id;

	const { data: eventsData, isLoading: isEventsLoading } = useQuery({
		...getEventsEventGetOptions({
			query: {
				end: dateTime().add(2, "day").format("YYYY-MM-DD"),
				room_id: roomId,
				start: dateTime().add(1, "day").format("YYYY-MM-DD"),
			},
		}),
		enabled: Boolean(roomId),
	});

	const events = eventsData?.items ?? [];

	useEffect(() => {
		if (selectedRoom) {
			stageRef.current?.position({ x: -selectedRoom.x, y: -selectedRoom.y });
		}
	}, [selectedRoom]);

	const [image] = useImage(`/map/floor${floor}.webp`);

	const { width = 0 } = useResizeObserver({
		box: "border-box",
		ref,
	});

	const [lastCenter, setLastCenter] = useState<Point | undefined>(undefined);
	const [lastDist, setLastDist] = useState(0);
	const [dragStopped, setDragStopped] = useState(false);
	const [scale, setScale] = useState(2);
	const [isDragging, setIsDragging] = useState(false);

	const pinch = useCallback(
		(e: Konva.KonvaEventObject<TouchEvent>) => {
			e.evt.preventDefault();
			const touch1 = e.evt.touches.item(0);
			const touch2 = e.evt.touches.item(1);
			const stage = e.target;

			// we need to restore dragging, if it was cancelled by multi-touch
			if (touch1 && !touch2 && !stage.isDragging() && dragStopped) {
				stage.startDrag();
				setDragStopped(false);
			}

			if (touch1 && touch2) {
				// if the stage was under Konva's drag&drop
				// we need to stop it, and implement our own pan logic with two pointers
				if (stage.isDragging()) {
					setDragStopped(true);
					stage.stopDrag();
				}

				const p1 = {
					x: touch1.clientX,
					y: touch1.clientY,
				};
				const p2 = {
					x: touch2.clientX,
					y: touch2.clientY,
				};

				if (!lastCenter) {
					setLastCenter(getCenter(p1, p2));
					return;
				}
				const newCenter = getCenter(p1, p2);

				const dist = getDistance(p1, p2);

				if (!lastDist) {
					setLastDist(dist);
				}

				// local coordinates of center point
				const pointTo = {
					x: (newCenter.x - stage.x()) / scale,
					y: (newCenter.y - stage.y()) / scale,
				};

				const newScale = scale * (dist / lastDist);

				setScale(newScale);

				// calculate new position of the stage
				const dx = newCenter.x - lastCenter.x;
				const dy = newCenter.y - lastCenter.y;

				const newPos = {
					x: newCenter.x - pointTo.x * scale + dx,
					y: newCenter.y - pointTo.y * scale + dy,
				};

				stage.position(newPos);

				setLastDist(dist);
				setLastCenter(newCenter);
			}
		},
		[dragStopped, lastCenter, lastDist, scale]
	);

	const onClick = useCallback(
		(fn: () => unknown) => () => {
			if (!isDragging) {
				fn();
			}
		},
		[isDragging]
	);

	return (
		<Card ref={ref} style={{ position: "relative" }}>
			<Stage
				draggable
				height={500}
				onDragEnd={() => {
					setIsDragging(false);
				}}
				onDragStart={() => {
					setIsDragging(true);
				}}
				onTouchEnd={() => {
					setLastDist(0);
					setLastCenter(undefined);
				}}
				onTouchMove={pinch}
				ref={stageRef}
				scale={{ x: scale, y: scale }}
				width={width}
			>
				<Layer>
					<Image height={239.29} image={image} width={480.52} />
				</Layer>
				<Layer>
					{floors[floor].map(room => (
						<Rect
							{...cursorPointer}
							fill={room.name === roomName ? "#ec9a0050" : undefined}
							stroke={room.name === roomName ? "#ec9a00" : "#759bff"}
							strokeWidth={1}
							{...room}
							key={room.name}
							onPointerClick={onClick(() => {
								void navigate(`/map/${floor}/${room.name}`);
							})}
						/>
					))}
				</Layer>
				<Layer>
					{selectedRoom && (
						<>
							<Rect
								cornerRadius={8}
								fill="white"
								height={Math.max(
									POPOVER_PADDING_TOP +
										POPOVER_TITLE_FONT_SIZE +
										POPOVER_TITLE_MARGIN +
										POPOVER_EVENT_HEIGHT * events.length +
										POPOVER_EVENTS_GAP * (events.length - 1) +
										POPOVER_PADDING_BOTTOM,
									POPOVER_MIN_HEIGHT
								)}
								shadowBlur={5}
								shadowColor="black"
								shadowOffsetX={0}
								shadowOffsetY={1}
								shadowOpacity={0.15}
								width={POPOVER_WIDTH}
								x={selectedRoom.x + selectedRoom.width + POPOVER_OFFSET_X}
								y={selectedRoom.y + selectedRoom.height}
							/>
							<Rect
								cornerRadius={2}
								fill="white"
								height={12}
								onPointerClick={onClick(() => {
									void navigate(`/map/${floor}`);
								})}
								onPointerEnter={e => {
									const container = e.target.getStage()?.container();
									if (container) {
										container.style.cursor = "pointer";
									}
									e.target.to({ duration: 0.1, stroke: "#759bff", strokeWidth: 1 });
								}}
								onPointerLeave={e => {
									e.target.to({ duration: 0.1, stroke: "#0000001a", strokeWidth: 0.5 });
									const container = e.target.getStage()?.container();
									if (container) {
										container.style.cursor = "default";
									}
								}}
								stroke="#0000001a"
								strokeWidth={0.5}
								width={12}
								x={selectedRoom.x + selectedRoom.width + POPOVER_OFFSET_X + POPOVER_WIDTH - 12 - POPOVER_PADDING_X}
								y={selectedRoom.y + selectedRoom.height + POPOVER_PADDING_TOP - 3}
							/>
							<Image
								height={12}
								image={xmark}
								listening={false}
								opacity={0.5}
								width={12}
								x={selectedRoom.x + selectedRoom.width + POPOVER_OFFSET_X + POPOVER_WIDTH - 12 - POPOVER_PADDING_X}
								y={selectedRoom.y + selectedRoom.height + POPOVER_PADDING_TOP - 3}
							/>
							<Text
								fill="black"
								fontFamily="Inter"
								fontSize={POPOVER_TITLE_FONT_SIZE}
								fontWeight="bold"
								height={POPOVER_TITLE_FONT_SIZE}
								text={selectedRoom.name}
								x={selectedRoom.x + selectedRoom.width + POPOVER_PADDING_X + POPOVER_OFFSET_X}
								y={selectedRoom.y + selectedRoom.height + POPOVER_PADDING_TOP}
							/>
							{isEventsLoading ? (
								<Text
									fill="black"
									fontFamily="Inter"
									fontSize={6}
									text="Загрузка..."
									x={selectedRoom.x + selectedRoom.width + POPOVER_PADDING_X + POPOVER_OFFSET_X}
									y={
										selectedRoom.y +
										selectedRoom.height +
										POPOVER_PADDING_TOP +
										POPOVER_TITLE_FONT_SIZE +
										POPOVER_TITLE_MARGIN
									}
								/>
							) : events.length > 0 ? (
								events.map((event, index) => (
									<Fragment key={event.id}>
										<Rect
											cornerRadius={4}
											height={POPOVER_EVENT_HEIGHT}
											onPointerClick={onClick(() => {
												void navigate(`/timetable/events/${event.id}`);
											})}
											onPointerEnter={e => {
												const container = e.target.getStage()?.container();
												if (container) {
													container.style.cursor = "pointer";
												}
												e.target.to({ duration: 0.1, stroke: "#759bff", strokeWidth: 1 });
											}}
											onPointerLeave={e => {
												e.target.to({ duration: 0.1, stroke: "#0000001a", strokeWidth: 0.5 });
												const container = e.target.getStage()?.container();
												if (container) {
													container.style.cursor = "default";
												}
											}}
											stroke="#0000001a"
											strokeWidth={0.5}
											width={POPOVER_WIDTH - POPOVER_PADDING_X * 2}
											x={selectedRoom.x + selectedRoom.width + POPOVER_PADDING_X + POPOVER_OFFSET_X}
											y={
												selectedRoom.y +
												selectedRoom.height +
												POPOVER_PADDING_TOP +
												POPOVER_TITLE_FONT_SIZE +
												POPOVER_TITLE_MARGIN +
												index * (POPOVER_EVENT_HEIGHT + POPOVER_EVENTS_GAP)
											}
										/>
										<Text
											fill="black"
											fontFamily="Inter"
											fontSize={POPOVER_EVENT_FONT_SIZE}
											fontWeight={700}
											listening={false}
											text={`${dateTime({ input: event.start_ts }).format("HH:mm")} ${event.name}`}
											width={POPOVER_WIDTH - (POPOVER_PADDING_X + POPOVER_EVENT_PADDING) * 2}
											x={
												selectedRoom.x +
												selectedRoom.width +
												POPOVER_PADDING_X +
												POPOVER_EVENT_PADDING +
												POPOVER_OFFSET_X
											}
											y={
												selectedRoom.y +
												selectedRoom.height +
												POPOVER_PADDING_TOP +
												POPOVER_TITLE_FONT_SIZE +
												POPOVER_TITLE_MARGIN +
												POPOVER_EVENT_PADDING +
												index * (POPOVER_EVENT_HEIGHT + POPOVER_EVENTS_GAP)
											}
										/>
									</Fragment>
								))
							) : (
								<Text
									fill="black"
									fontFamily="Inter"
									fontSize={6}
									text="Сегодня нет пар"
									width={POPOVER_WIDTH - POPOVER_PADDING_X * 2}
									x={selectedRoom.x + selectedRoom.width + POPOVER_PADDING_X + POPOVER_OFFSET_X}
									y={
										selectedRoom.y +
										selectedRoom.height +
										POPOVER_PADDING_TOP +
										POPOVER_TITLE_FONT_SIZE +
										POPOVER_TITLE_MARGIN
									}
								/>
							)}
						</>
					)}
				</Layer>
			</Stage>
			<Flex
				direction="column"
				gap={2}
				style={{
					position: "absolute",
					right: 16,
					top: "50%",
					transform: "translateY(-50%)",
				}}
			>
				<Button
					onClick={() => {
						setScale(scale * 1.125);
					}}
					size="xl"
					view="action"
				>
					<Icon data={Plus} />
				</Button>
				<Button
					onClick={() => {
						setScale(scale / 1.125);
					}}
					size="xl"
					view="action"
				>
					<Icon data={Minus} />
				</Button>
			</Flex>
		</Card>
	);
};

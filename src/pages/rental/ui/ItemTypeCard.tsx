import { Button, Card, Flex, Label, spacing, Text } from "@gravity-ui/uikit";
import { useState } from "react";

import type { ItemTypeGet } from "@/shared/api/rental";

import { formatRentalDateTime, isCooldownActive } from "../helpers";
import styles from "./ItemTypeCard.module.css";

interface ItemTypeCardProps {
	itemType: ItemTypeGet;
	onReserve: (itemType: ItemTypeGet) => void;
	reserving: boolean;
}

export const ItemTypeCard = ({ itemType, onReserve, reserving }: ItemTypeCardProps) => {
	const [imageBroken, setImageBroken] = useState(false);

	const availableCount = itemType.available_items_count ?? 0;
	const cooldownActive = isCooldownActive(itemType.cool_down_end_ts);
	const canReserve = Boolean(itemType.availability) && availableCount > 0 && !cooldownActive;

	return (
		<Card className={styles.card}>
			<Flex className={spacing({ p: 3 })} direction="column" gap={2} height={"100%"}>
				{itemType.image_url && !imageBroken ? (
					<img
						alt={itemType.name}
						className={styles.image}
						onError={() => setImageBroken(true)}
						src={itemType.image_url}
					/>
				) : (
					<Flex alignItems="center" className={styles.imagePlaceholder} justifyContent="center">
						<Text color="secondary">{itemType.name.slice(0, 1).toUpperCase()}</Text>
					</Flex>
				)}
				<Flex alignItems="center" gap={2} justifyContent="space-between">
					<Text variant="subheader-2">{itemType.name}</Text>
					{cooldownActive ? (
						<Label theme="warning">Недоступно</Label>
					) : (
						<Label theme={availableCount > 0 ? "success" : "unknown"}>Доступно: {availableCount}</Label>
					)}
				</Flex>
				{itemType.description && itemType.description !== "null" && (
					<Text color="secondary" ellipsis ellipsisLines={3}>
						{itemType.description}
					</Text>
				)}
				{cooldownActive && <Text color="secondary">Откроется {formatRentalDateTime(itemType.cool_down_end_ts)}</Text>}
				<Flex className={styles.reserve}>
					<Button
						disabled={!canReserve}
						loading={reserving}
						onClick={() => onReserve(itemType)}
						view="action"
						width="max"
					>
						Забронировать
					</Button>
				</Flex>
			</Flex>
		</Card>
	);
};

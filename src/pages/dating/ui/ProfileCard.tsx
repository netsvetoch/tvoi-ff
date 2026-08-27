import { Avatar, Card, Flex, spacing, Text } from "@gravity-ui/uikit";
import { useNavigate } from "@tanstack/react-router";

import type { Profile } from "@/shared/api/dating/types.gen";

import styles from "./ProfileCard.module.css";

interface ProfileCardProps {
	profile: Profile;
}

export const ProfileCard = ({ profile }: ProfileCardProps) => {
	const navigate = useNavigate();

	const { age, description, gender, id, interests, name } = profile;

	return (
		<Card
			className={styles.card}
			onClick={() => {
				navigate({ params: { id: String(id) }, to: "/dating/$id" });
			}}
			type="action"
		>
			<Flex alignItems="center" className={spacing({ p: 3 })} direction="column" gap={2}>
				<Avatar size="xl" text={name || "?"} />
				<Flex alignItems="center" direction="column">
					<Text variant="subheader-2">
						{name}, {age}
					</Text>
					<Text color="secondary">{gender}</Text>
				</Flex>
				{description && (
					<Text color="secondary" ellipsis ellipsisLines={2}>
						{description}
					</Text>
				)}
				{interests && (
					<Text color="secondary" ellipsis ellipsisLines={1}>
						Интересы: {interests}
					</Text>
				)}
			</Flex>
		</Card>
	);
};

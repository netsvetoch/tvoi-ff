import { dateTime } from "@gravity-ui/date-utils";
import { TrashBin } from "@gravity-ui/icons";
import { Button, Card, Flex, Icon, spacing, Text } from "@gravity-ui/uikit";

import type { Comment } from "@/shared/api/dating/types.gen";

interface DatingCommentCardProps {
	comment: Comment;
	onDelete: () => void;
}

export const DatingCommentCard = ({ comment, onDelete }: DatingCommentCardProps) => {
	const { author_name: authorName, content, created_at: createdAt } = comment;

	return (
		<Card className={spacing({ p: 3 })}>
			<Flex direction="column" gap={2}>
				<Flex alignItems="center" gap={2} justifyContent="space-between">
					<Text variant="subheader-1">{authorName || "Аноним"}</Text>
					<Flex alignItems="center" gap={2}>
						<Text color="secondary">{dateTime({ input: createdAt }).format("DD.MM.YYYY HH:mm")}</Text>
						<Button onClick={onDelete} size="s" title="Удалить комментарий" view="flat">
							<Icon data={TrashBin} size={14} />
						</Button>
					</Flex>
				</Flex>
				<Text style={{ whiteSpace: "pre-wrap" }}>{content}</Text>
			</Flex>
		</Card>
	);
};

import { dateTime } from "@gravity-ui/date-utils";
import { Card, Flex, spacing, Text } from "@gravity-ui/uikit";

import { formatNumber, getTextNumberColor } from "@/shared/helpers";

import type { CommentGet } from "@/shared/api/rating/types.gen";

interface LecturerCommentProps {
	comment: CommentGet;
}

export const LecturerComment = ({
	comment: { create_ts, mark_clarity, mark_freebie, mark_general, mark_kindness, text, user_id },
}: LecturerCommentProps) => {
	return (
		<Card className={spacing({ p: 3 })}>
			<Flex direction="column" gap={2}>
				<div style={{ alignItems: "center", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
					<Text color={getTextNumberColor(mark_kindness)}>
						{mark_kindness >= 0 ? "Доброта" : "Злобность"}: {Math.abs(mark_kindness).toFixed(2)}
					</Text>
					<Text color={getTextNumberColor(mark_freebie)}>
						{mark_freebie >= 0 ? "Халявность" : "Строгость"}: {Math.abs(mark_freebie).toFixed(2)}
					</Text>
					<Text color={getTextNumberColor(mark_clarity)}>
						{mark_clarity >= 0 ? "Понятность" : "Бредовость"} {Math.abs(mark_clarity).toFixed(2)}
					</Text>
					<Text color={getTextNumberColor(mark_general)} style={{ fontWeight: 700, justifySelf: "flex-end" }}>
						{formatNumber(mark_general)}
					</Text>
				</div>
				<p
					dangerouslySetInnerHTML={{
						__html: text.replaceAll(String.raw`\n`, "<br>").replaceAll(String.raw`\"`, '"'),
					}}
				/>
				<Flex justifyContent="flex-end">
					<Text color="secondary">
						{dateTime({ input: create_ts }).format("DD.MM.YYYY")} | Автор: {user_id ?? "Аноним"}
					</Text>
				</Flex>
			</Flex>
		</Card>
	);
};

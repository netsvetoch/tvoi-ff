import {
	Avatar,
	Button,
	Card,
	Dialog,
	DropdownMenu,
	Flex,
	Skeleton,
	spacing,
	Text,
	useToaster,
} from "@gravity-ui/uikit";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import type { AchievementApiRoutesAchievementAchievementGet } from "@/shared/api/achievement/types.gen";

import {
	deleteAchievementAchievementIdDeleteMutation,
	getAllAchievementsAchievementGetOptions,
	getAllAchievementsAchievementGetQueryKey,
	getAllAchievementsUserUserIdGetQueryKey,
} from "@/shared/api/achievement/@tanstack/react-query.gen";
import { client } from "@/shared/api/achievement/client.gen";
import { resolveServiceAssetUrl } from "@/shared/helpers";
import { useLoginData } from "@/shared/hooks";

import { getAchievementErrorMessage } from "../helpers";
import { AchievementFormDialog } from "./AchievementFormDialog";
import { AchievementPictureDialog } from "./AchievementPictureDialog";
import { AchievementRecieversDialog } from "./AchievementRecieversDialog";

const achievementBaseUrl = client.getConfig().baseUrl;

interface AchievementCardProps {
	achievement: AchievementApiRoutesAchievementAchievementGet;
	onDelete: () => void;
	onEdit: () => void;
	onPicture: () => void;
	onRecievers: () => void;
}

const AchievementCard = ({ achievement, onDelete, onEdit, onPicture, onRecievers }: AchievementCardProps) => {
	const pictureUrl = resolveServiceAssetUrl(achievement.picture, achievementBaseUrl);

	return (
		<Card>
			<Flex className={spacing({ p: 3 })} gap={3}>
				<Avatar imgUrl={pictureUrl} size="l" text={achievement.name || "?"} />
				<Flex direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
					<Text ellipsis variant="subheader-2">
						{achievement.name}
					</Text>
					<Text color="secondary" style={{ whiteSpace: "pre-wrap" }}>
						{achievement.description}
					</Text>
					<Text color="secondary" variant="caption-2">
						Владелец: пользователь №{achievement.owner_user_id}
					</Text>
				</Flex>
				<DropdownMenu
					items={[
						{
							action: onEdit,
							text: "Изменить",
						},
						{
							action: onPicture,
							text: "Картинка",
						},
						{
							action: onRecievers,
							text: "Получатели",
						},
						{
							action: onDelete,
							text: "Удалить",
							theme: "danger",
						},
					]}
				/>
			</Flex>
		</Card>
	);
};

export const AchievementsCatalog = () => {
	const { token, user_id } = useLoginData();
	const queryClient = useQueryClient();
	const toaster = useToaster();

	const [formOpen, setFormOpen] = useState(false);
	const [editingAchievement, setEditingAchievement] = useState<AchievementApiRoutesAchievementAchievementGet>();
	const [pictureAchievement, setPictureAchievement] = useState<AchievementApiRoutesAchievementAchievementGet>();
	const [recieversAchievement, setRecieversAchievement] = useState<AchievementApiRoutesAchievementAchievementGet>();
	const [deletingAchievement, setDeletingAchievement] = useState<AchievementApiRoutesAchievementAchievementGet>();

	const { data: achievements, isLoading } = useQuery(getAllAchievementsAchievementGetOptions({ auth: token }));

	const deleteMutation = useMutation({
		...deleteAchievementAchievementIdDeleteMutation(),
		onError: error => {
			toaster.add({
				content: getAchievementErrorMessage(error),
				name: "achievement-delete-error",
				theme: "danger",
			});
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: getAllAchievementsAchievementGetQueryKey() });
			void queryClient.invalidateQueries({
				queryKey: getAllAchievementsUserUserIdGetQueryKey({ path: { user_id: user_id ?? 0 } }),
			});
			setDeletingAchievement(undefined);
			toaster.add({
				content: "Достижение удалено",
				name: "achievement-delete-success",
				theme: "success",
			});
		},
	});

	return (
		<Card className={spacing({ mt: 3, p: 3 })}>
			<Flex direction="column" gap={3}>
				<Flex alignItems="center" gap={2} justifyContent="space-between">
					<Text variant="subheader-2">Управление достижениями</Text>
					<Button
						onClick={() => {
							setEditingAchievement(undefined);
							setFormOpen(true);
						}}
						size="s"
						view="action"
					>
						Создать достижение
					</Button>
				</Flex>
				{isLoading && (
					<Flex direction="column" gap={2}>
						<Skeleton style={{ height: 88 }} />
						<Skeleton style={{ height: 88 }} />
					</Flex>
				)}
				{!isLoading && (achievements?.length ?? 0) === 0 && <Text color="secondary">Достижений пока нет.</Text>}
				{!isLoading && (achievements?.length ?? 0) > 0 && (
					<Flex direction="column" gap={2}>
						{(achievements ?? []).map(achievement => (
							<AchievementCard
								achievement={achievement}
								key={achievement.id}
								onDelete={() => setDeletingAchievement(achievement)}
								onEdit={() => {
									setEditingAchievement(achievement);
									setFormOpen(true);
								}}
								onPicture={() => setPictureAchievement(achievement)}
								onRecievers={() => setRecieversAchievement(achievement)}
							/>
						))}
					</Flex>
				)}
			</Flex>

			{formOpen && <AchievementFormDialog achievement={editingAchievement} onClose={() => setFormOpen(false)} />}
			{pictureAchievement && (
				<AchievementPictureDialog
					achievementId={pictureAchievement.id}
					achievementName={pictureAchievement.name}
					onClose={() => setPictureAchievement(undefined)}
				/>
			)}
			{recieversAchievement && (
				<AchievementRecieversDialog
					achievementId={recieversAchievement.id}
					achievementName={recieversAchievement.name}
					onClose={() => setRecieversAchievement(undefined)}
				/>
			)}
			<Dialog onClose={() => setDeletingAchievement(undefined)} open={deletingAchievement !== undefined} size="s">
				<Dialog.Header caption="Удалить достижение?" />
				<Dialog.Body>
					<Text>
						Достижение «{deletingAchievement?.name}» будет удалено вместе со всеми выдачами. Это действие нельзя
						отменить.
					</Text>
				</Dialog.Body>
				<Dialog.Footer
					loading={deleteMutation.isPending}
					onClickButtonApply={() => {
						if (token && deletingAchievement) {
							deleteMutation.mutate({ auth: token, path: { id: deletingAchievement.id } });
						}
					}}
					onClickButtonCancel={() => setDeletingAchievement(undefined)}
					preset="danger"
					textButtonApply="Удалить"
					textButtonCancel="Назад"
				/>
			</Dialog>
		</Card>
	);
};

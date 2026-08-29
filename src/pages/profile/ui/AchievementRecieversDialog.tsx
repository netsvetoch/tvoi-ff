import { Button, Dialog, Flex, Loader, Text, TextInput, useToaster } from "@gravity-ui/uikit";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
	createRecieverAchievementAchievementIdRecieverUserIdPostMutation,
	getAllAchievementsAchievementGetQueryKey,
	getAllAchievementsUserUserIdGetQueryKey,
	getAllRecieversAchievementAchievementIdRecieverGetOptions,
	getAllRecieversAchievementAchievementIdRecieverGetQueryKey,
	revokeRecieverAchievementAchievementIdRecieverUserIdDeleteMutation,
} from "@/shared/api/achievement/@tanstack/react-query.gen";
import { useLoginData } from "@/shared/hooks";

import { getAchievementErrorMessage } from "../helpers";

interface AchievementRecieversDialogProps {
	achievementId: number;
	achievementName: string;
	onClose: () => void;
}

export const AchievementRecieversDialog = ({
	achievementId,
	achievementName,
	onClose,
}: AchievementRecieversDialogProps) => {
	const { token, user_id } = useLoginData();
	const queryClient = useQueryClient();
	const toaster = useToaster();

	const [recieverId, setRecieverId] = useState("");
	const [recieverIdInvalid, setRecieverIdInvalid] = useState(false);

	const { data: recieversData, isLoading } = useQuery({
		...getAllRecieversAchievementAchievementIdRecieverGetOptions({
			auth: token,
			path: { achievement_id: achievementId },
		}),
		enabled: Boolean(token),
	});

	const invalidateRecievers = () => {
		void queryClient.invalidateQueries({
			queryKey: getAllRecieversAchievementAchievementIdRecieverGetQueryKey({
				path: { achievement_id: achievementId },
			}),
		});
		void queryClient.invalidateQueries({ queryKey: getAllAchievementsAchievementGetQueryKey() });
		void queryClient.invalidateQueries({
			queryKey: getAllAchievementsUserUserIdGetQueryKey({ path: { user_id: user_id ?? 0 } }),
		});
	};

	const toastDanger = (content: string) => {
		toaster.add({ content, name: "achievement-recievers-error", theme: "danger" });
	};

	const giveMutation = useMutation({
		...createRecieverAchievementAchievementIdRecieverUserIdPostMutation(),
		onError: error => {
			toastDanger(getAchievementErrorMessage(error));
		},
		onSuccess: () => {
			invalidateRecievers();
			setRecieverId("");
			toaster.add({
				content: "Достижение выдано",
				name: "achievement-recievers-success",
				theme: "success",
			});
		},
	});

	const revokeMutation = useMutation({
		...revokeRecieverAchievementAchievementIdRecieverUserIdDeleteMutation(),
		onError: error => {
			toastDanger(getAchievementErrorMessage(error));
		},
		onSuccess: () => {
			invalidateRecievers();
			toaster.add({
				content: "Достижение отозвано",
				name: "achievement-recievers-success",
				theme: "success",
			});
		},
	});

	const closeDialog = () => {
		setRecieverId("");
		setRecieverIdInvalid(false);
		onClose();
	};

	const give = () => {
		const parsedId = Number(recieverId);

		if (!recieverId.trim() || !Number.isInteger(parsedId) || parsedId <= 0) {
			setRecieverIdInvalid(true);
			return;
		}

		if (!token) {
			toastDanger("Требуется авторизация");
			return;
		}

		giveMutation.mutate({ auth: token, path: { achievement_id: achievementId, user_id: parsedId } });
	};

	const recievers = recieversData?.recievers ?? [];

	const renderRecievers = () => {
		if (isLoading) {
			return (
				<Flex alignItems="center" justifyContent="center" style={{ minHeight: 80 }}>
					<Loader size="l" />
				</Flex>
			);
		}

		if (recievers.length === 0) {
			return <Text color="secondary">Получателей пока нет.</Text>;
		}

		return (
			<Flex direction="column" gap={1}>
				{recievers.map(({ user_id: recieverUserId }) => (
					<Flex alignItems="center" gap={2} justifyContent="space-between" key={recieverUserId}>
						<Text>Пользователь №{recieverUserId}</Text>
						<Button
							disabled={revokeMutation.isPending}
							onClick={() => {
								if (token) {
									revokeMutation.mutate({
										auth: token,
										path: { achievement_id: achievementId, user_id: recieverUserId },
									});
								}
							}}
							size="s"
							view="outlined-danger"
						>
							Отозвать
						</Button>
					</Flex>
				))}
			</Flex>
		);
	};

	return (
		<Dialog onClose={closeDialog} open size="m">
			<Dialog.Header caption={`Получатели: ${achievementName}`} />
			<Dialog.Body>
				<Flex direction="column" gap={3}>
					{renderRecievers()}
					<form
						onSubmit={event => {
							event.preventDefault();
							give();
						}}
					>
						<Flex alignItems="flex-end" gap={2}>
							<Flex direction="column" gap={1} style={{ flex: 1 }}>
								<TextInput
									errorMessage={recieverIdInvalid ? "Введите числовой идентификатор пользователя" : undefined}
									label="Идентификатор пользователя"
									onUpdate={value => {
										setRecieverId(value);
										setRecieverIdInvalid(false);
									}}
									type="number"
									validationState={recieverIdInvalid ? "invalid" : undefined}
									value={recieverId}
								/>
							</Flex>
							<Button loading={giveMutation.isPending} type="submit" view="action">
								Выдать
							</Button>
						</Flex>
					</form>
				</Flex>
			</Dialog.Body>
			<Dialog.Footer
				onClickButtonApply={closeDialog}
				onClickButtonCancel={closeDialog}
				textButtonApply="Закрыть"
				textButtonCancel="Отмена"
			/>
		</Dialog>
	);
};

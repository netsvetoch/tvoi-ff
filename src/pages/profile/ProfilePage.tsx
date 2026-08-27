import { dateTime } from "@gravity-ui/date-utils";
import { Card, Flex, Label, Skeleton, spacing, Text, useToaster } from "@gravity-ui/uikit";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import type { UserInfoUpdate } from "@/shared/api/userdata";

import { getAllAchievementsUserUserIdGetOptions } from "@/shared/api/achievement/@tanstack/react-query.gen";
import { getSessionsSessionGetOptions } from "@/shared/api/auth/@tanstack/react-query.gen";
import {
	getUserInfoUserIdGetOptions,
	updateUserUserIdPostMutation,
} from "@/shared/api/userdata/@tanstack/react-query.gen";
import { useLoginData } from "@/shared/hooks";
import { Container, PageHeader } from "@/shared/ui";
import { KeyValue } from "@/shared/ui/KeyValue";

import { ProfileAvatar, ProfileDropdownMenu, UserdataCard } from "./ui";

export const ProfilePage = () => {
	const [readonly, setReadonly] = useState(true);
	const { id: session_id, token, user_id } = useLoginData();
	const { data: userData, isLoading: isUserDataLoading } = useQuery(
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		getUserInfoUserIdGetOptions({ auth: token, path: { id: user_id! } })
	);

	const toaster = useToaster();

	const methods = useForm<UserInfoUpdate>({
		values: {
			items: userData?.items ?? [],
			source: "user",
		},
	});

	const categories = useMemo(() => {
		return [...new Set(userData?.items.map(item => item.category))];
	}, [userData]);

	const items = useMemo(() => {
		return userData?.items.map((item, index) => ({ ...item, index })) ?? [];
	}, [userData]);

	const { data: achievements, isLoading: isAchievementsLoading } = useQuery(
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		getAllAchievementsUserUserIdGetOptions({ auth: token, path: { user_id: user_id! } })
	);

	const { data: sessions } = useQuery(getSessionsSessionGetOptions({ auth: token }));

	const { mutate: updateUser } = useMutation({
		...updateUserUserIdPostMutation(),
		onError: error => {
			toaster.add({
				content: "ru" in error ? (error.ru as string) : "Неизвестная ошибка",
				name: "update-user-error",
				theme: "danger",
			});
		},
		onSuccess: () => {
			toaster.add({
				content: "Данные обновлены",
				name: "update-user-success",
				theme: "success",
			});
			methods.reset();
			setReadonly(true);
		},
	});

	const onSubmit = (data: UserInfoUpdate) => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		updateUser({ auth: token, body: { items: data.items, source: "user" }, path: { id: user_id! } });
	};

	return (
		<>
			<PageHeader
				actions={
					<Flex gap={2}>
						{/* {!readonly && (
							<Button
								onClick={() => {
									methods.reset(userData);
									setReadonly(true);
								}}
							>
								Отмена
							</Button>
						)}
						{readonly && (
							<Button
								view="action"
								onClick={() => {
									setReadonly(prev => !prev);
								}}
								loading={isLoading}
								type="button"
							>
								Редактировать
							</Button>
						)}
						{!readonly && (
							<Button view="action" loading={isUpdating} form="profile-form" type="submit">
								Сохранить
							</Button>
						)} */}
						<ProfileDropdownMenu />
					</Flex>
				}
				breadcrumbs={[{ href: "/profile", label: "Профиль" }]}
			/>
			<Container
				aside={
					<Flex direction={"column"} gap={3}>
						<Card className={spacing({ p: 3 })} style={{ display: "flex", flexDirection: "column" }}>
							<Text className={spacing({ mb: 3 })} variant="subheader-2">
								Достижения
							</Text>
							{isAchievementsLoading ? (
								<Skeleton style={{ height: 18 }} />
							) : (
								<>
									{achievements?.achievement.length ? (
										<div
											style={{
												display: "grid",
												gap: 10,
												gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
											}}
										>
											{achievements?.achievement
												.filter(({ picture }) => Boolean(picture))
												.map(({ id, name, picture }) => (
													<div key={id}>
														<img alt={name ?? ""} src={picture as string} style={{ aspectRatio: 1, display: "flex" }} />
													</div>
												))}
										</div>
									) : (
										<Text>Пока нет достижений</Text>
									)}
								</>
							)}
						</Card>
						<Card className={spacing({ p: 3 })} style={{ display: "flex", flexDirection: "column" }}>
							<Text className={spacing({ mb: 3 })} variant="subheader-2">
								Сессии
							</Text>
							{isUserDataLoading ? (
								<Skeleton style={{ height: 20 }} />
							) : (
								<Flex direction={"column"} gap={1}>
									{sessions?.map(({ id, last_activity, session_name }) => (
										<KeyValue
											key={id}
											title={
												<Flex alignItems={"center"} gap={1}>
													{id === session_id && <Label size="xs">Текущая</Label>}
													{session_name || "Без имени"}
												</Flex>
											}
											value={dateTime({ input: `${last_activity}Z` }).fromNow()}
										/>
									))}
								</Flex>
							)}
						</Card>
					</Flex>
				}
			>
				<ProfileAvatar
					className={spacing({ mb: 3 })}
					imgUrl={userData?.items.find(i => i.param === "Фоо")?.value ?? "kek"}
					loading={isUserDataLoading}
					name={userData?.items.find(i => i.param === "Электронная почта")?.value ?? ""}
				/>
				<FormProvider {...methods}>
					<form id="profile-form" onSubmit={methods.handleSubmit(onSubmit)}>
						<Flex direction={"column"} gap={3}>
							{isUserDataLoading ? (
								<>
									<Skeleton style={{ height: 82 }} />
									<Skeleton style={{ height: 82 }} />
								</>
							) : (
								categories?.map(category => (
									<UserdataCard
										category={category}
										items={items.filter(item => item.category === category)}
										key={category}
										readonly={readonly}
									/>
								))
							)}
						</Flex>
					</form>
				</FormProvider>
			</Container>
		</>
	);
};

import { Plus } from "@gravity-ui/icons";
import { Button, Dialog, Flex, Loader, Select, Text, TextInput, useToaster } from "@gravity-ui/uikit";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import {
	createProfileProfilesPostMutation,
	getProfilesProfilesGetInfiniteOptions,
	getProfilesProfilesGetInfiniteQueryKey,
} from "@/shared/api/dating/@tanstack/react-query.gen";
import { Container, PageHeader } from "@/shared/ui";

import pageStyles from "./DatingPage.module.css";
import { DATING_PAGE_SIZE, GENDER_OPTIONS, getDatingErrorMessage } from "./helpers";
import { ProfileCard, ProfileForm, type ProfileFormValues } from "./ui";
import styles from "./ui/ProfileCard.module.css";

const parseAgeFilter = (value: string): number | undefined => {
	if (!value.trim()) {
		return undefined;
	}

	const parsed = Number(value);

	return Number.isFinite(parsed) ? parsed : undefined;
};

export const DatingPage = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const toaster = useToaster();

	const [minAge, setMinAge] = useState("");
	const [maxAge, setMaxAge] = useState("");
	const [gender, setGender] = useState<string[]>([]);
	const [showCreateDialog, setShowCreateDialog] = useState(false);

	const profilesQuery = useInfiniteQuery({
		...getProfilesProfilesGetInfiniteOptions({
			query: {
				gender: gender[0],
				limit: DATING_PAGE_SIZE,
				max_age: parseAgeFilter(maxAge),
				min_age: parseAgeFilter(minAge),
			},
		}),
		getNextPageParam: (lastPage, allPages) => (lastPage.length === DATING_PAGE_SIZE ? allPages.length + 1 : undefined),
		initialPageParam: 1,
	});

	const profiles = profilesQuery.data?.pages.flat() ?? [];

	const createMutation = useMutation({
		...createProfileProfilesPostMutation(),
		onError: error => {
			toaster.add({
				content: getDatingErrorMessage(error),
				name: "dating-profile-create-error",
				theme: "danger",
			});
		},
		onSuccess: profile => {
			setShowCreateDialog(false);
			toaster.add({
				content: "Анкета создана.",
				name: "dating-profile-create-success",
				theme: "success",
			});
			void queryClient.invalidateQueries({ queryKey: getProfilesProfilesGetInfiniteQueryKey() });
			navigate({ params: { id: String(profile.id) }, to: "/dating/$id" });
		},
	});

	const submitCreate = (values: ProfileFormValues) => {
		createMutation.mutate({
			body: {
				age: values.age,
				contact: values.contact,
				description: values.description || null,
				gender: values.gender,
				interests: values.interests || null,
				name: values.name,
			},
		});
	};

	return (
		<>
			<PageHeader
				actions={
					<Button onClick={() => setShowCreateDialog(true)} view="action">
						<Plus />
						Создать анкету
					</Button>
				}
				breadcrumbs={[{ href: "/dating", label: "Знакомства" }]}
			/>
			<Container>
				<Flex direction="column" gap={3}>
					<Flex alignItems="flex-end" gap={3}>
						<TextInput label="Возраст от" onUpdate={setMinAge} style={{ width: 120 }} type="number" value={minAge} />
						<TextInput label="Возраст до" onUpdate={setMaxAge} style={{ width: 120 }} type="number" value={maxAge} />
						<Flex style={{ width: 160 }}>
							<Select
								className={pageStyles.select}
								hasClear
								label="Пол"
								onUpdate={setGender}
								options={GENDER_OPTIONS}
								value={gender}
							/>
						</Flex>
					</Flex>

					{profilesQuery.isLoading && (
						<Flex alignItems="center" justifyContent="center" style={{ minHeight: 300 }}>
							<Loader size="l" />
						</Flex>
					)}
					{!profilesQuery.isLoading && profiles.length === 0 && (
						<Flex alignItems="center" justifyContent="center" style={{ minHeight: 300 }}>
							<Text color="secondary" variant="subheader-2">
								Анкеты не найдены
							</Text>
						</Flex>
					)}
					{!profilesQuery.isLoading && profiles.length > 0 && (
						<>
							<div className={styles.grid}>
								{profiles.map(profile => (
									<ProfileCard key={profile.id} profile={profile} />
								))}
							</div>
							{profilesQuery.hasNextPage && (
								<Flex justifyContent="center">
									<Button loading={profilesQuery.isFetchingNextPage} onClick={() => profilesQuery.fetchNextPage()}>
										Показать ещё
									</Button>
								</Flex>
							)}
						</>
					)}
				</Flex>
			</Container>

			<Dialog onClose={() => setShowCreateDialog(false)} open={showCreateDialog} size="m">
				<Dialog.Header caption="Новая анкета" />
				<Dialog.Body>
					<ProfileForm
						onCancel={() => setShowCreateDialog(false)}
						onSubmit={submitCreate}
						pending={createMutation.isPending}
						submitLabel="Создать анкету"
					/>
				</Dialog.Body>
			</Dialog>
		</>
	);
};

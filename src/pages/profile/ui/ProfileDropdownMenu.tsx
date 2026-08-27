import { ConfirmDialog } from "@gravity-ui/components";
import { DropdownMenu, useToaster } from "@gravity-ui/uikit";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import type { AuthBackendAuthMethodSessionSession } from "@/shared/api/auth/types.gen";

import {
	deleteUserUserUserIdDeleteMutation,
	logoutLogoutPostMutation,
	updateSessionSessionIdPatchMutation,
} from "@/shared/api/auth/@tanstack/react-query.gen";
import { useLoginData, useModal } from "@/shared/hooks";

export const ProfileDropdownMenu = () => {
	const { id: session_id, removeLoginData, setLoginData, token, user_id } = useLoginData();
	const toaster = useToaster();
	const navigate = useNavigate();

	const { mutate: logout } = useMutation({
		...logoutLogoutPostMutation(),
		onError: error =>
			toaster.add({
				content: "ru" in error ? (error.ru as string) : "Неизвестная ошибка",
				name: "logout-error",
				theme: "danger",
			}),
		onSuccess: () => {
			toaster.add({ content: "Выход выполнен успешно", name: "logout-success", theme: "success" });
			removeLoginData();
			navigate({ to: "/login" });
		},
	});

	const [showModal, modal] = useModal(({ onApply, onReject, open }) => (
		<ConfirmDialog
			message="Вы уверены, что хотите удалить аккаунт?"
			onClickButtonApply={onApply}
			onClickButtonCancel={onReject}
			onClose={onReject}
			open={open}
			propsButtonApply={{ view: "outlined-danger" }}
			textButtonApply="Удалить"
			textButtonCancel="Отмена"
			title="Подтвердите действие"
		/>
	));

	const { mutate: updateSession } = useMutation({
		...updateSessionSessionIdPatchMutation(),
		onError: error => {
			toaster.add({
				content: "ru" in error ? (error.ru as string) : "Неизвестная ошибка",
				name: "update-session-error",
				theme: "danger",
			});
		},
		onSuccess: data => {
			setLoginData(data as AuthBackendAuthMethodSessionSession);
			deleteUser({
				auth: token,
				path: {
					user_id: data.user_id,
				},
			});
		},
	});

	const { mutate: deleteUser } = useMutation({
		...deleteUserUserUserIdDeleteMutation(),
		onError: error => {
			if ((error.detail as unknown as string) === "Not authorized") {
				return updateSession({
					auth: token,
					body: {
						scopes: ["auth.user.selfdelete"],
					},
					path: {
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						id: session_id!,
					},
				});
			}

			toaster.add({
				content: "ru" in error ? (error.ru as string) : "Неизвестная ошибка",
				name: "delete-user-error",
				theme: "danger",
			});
		},
		onSuccess: () => {
			toaster.add({
				content: "Аккаунт успешно удален",
				name: "delete-user-success",
				theme: "success",
			});
			removeLoginData();
			navigate({ to: "/login" });
		},
	});

	return (
		<>
			<DropdownMenu
				items={[
					{
						action: () => logout({ auth: token }),
						text: "Выйти",
					},
					{
						action: async () => {
							const isConfirmed = await showModal();

							if (!isConfirmed) {
								return;
							}

							deleteUser({
								auth: token,
								path: {
									// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
									user_id: user_id!,
								},
							});
						},
						text: "Удалить аккаунт",
						theme: "danger",
					},
				]}
			/>
			{modal}
		</>
	);
};

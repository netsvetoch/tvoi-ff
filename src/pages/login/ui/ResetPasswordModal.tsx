import { Dialog, Flex, TextInput, useToaster } from "@gravity-ui/uikit";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { requestResetForgottenPasswordEmailResetPasswordRestorePostMutation } from "@/shared/api/auth/@tanstack/react-query.gen";

interface ResetPasswordModalProps {
	email: string;
	onClose: () => void;
	open: boolean;
}

export const ResetPasswordModal = ({ email: initialEmail, onClose, open }: ResetPasswordModalProps) => {
	const toaster = useToaster();
	const [email, setEmail] = useState(initialEmail);

	const { mutate: requestResetPassword } = useMutation({
		...requestResetForgottenPasswordEmailResetPasswordRestorePostMutation(),
		onError: error => {
			toaster.add({
				content: error.detail && "ru" in error.detail ? (error.detail.ru as string) : "Неизвестная ошибка",
				name: "request-reset-password-error",
				theme: "danger",
			});
		},
		onSuccess: data => {
			onClose();
			toaster.add({
				autoHiding: false,
				content: `${data.ru}. Если сменили, можете войти`,
				name: "request-reset-password",
				theme: "utility",
			});
		},
	});

	useEffect(() => {
		if (open) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setEmail(initialEmail);
		}
	}, [initialEmail, open]);

	return (
		<Dialog onClose={onClose} open={open} size="m">
			<Dialog.Header caption="Восстановить пароль" />
			<Dialog.Body>
				<Flex direction="column" gap={2}>
					<TextInput label="Email" onUpdate={setEmail} size="l" type="email" value={email} />
				</Flex>
			</Dialog.Body>
			<Dialog.Footer
				onClickButtonApply={() => {
					requestResetPassword({ body: { email } });
				}}
				onClickButtonCancel={onClose}
				propsButtonApply={{ view: "action" }}
				textButtonApply="Восстановить"
				textButtonCancel="Отмена"
			/>
		</Dialog>
	);
};

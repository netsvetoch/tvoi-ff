import { useBoolean } from "@reactuses/core";
import { type ReactNode, useCallback, useMemo, useState } from "react";

interface ModalResolvers<CloseValue, ApplyValue, RejectValue> {
	reject: (value?: RejectValue) => void;
	resolve: (value?: ApplyValue | CloseValue) => void;
}

interface RenderModalOptions<CloseValue = void, ApplyValue = void, RejectValue = void> {
	onApply: (value?: ApplyValue) => void;
	onClose: (value?: CloseValue) => void;
	onReject: (value?: RejectValue) => void;
	open: boolean;
}

export const useModal = <CloseValue, ApplyValue, RejectValue, AdditionalData>(
	renderModal: (
		options: RenderModalOptions<CloseValue, ApplyValue, RejectValue>,
		additionalData?: AdditionalData
	) => ReactNode,
	keepMounted = true
) => {
	const { setFalse: hide, setTrue: show, value: open } = useBoolean(false);
	const [additionalData, setAdditionalData] = useState<AdditionalData>();
	const [resolvers, setResolvers] = useState<ModalResolvers<CloseValue, ApplyValue, RejectValue> | undefined>();

	const showModal = useCallback(
		async (data?: AdditionalData): Promise<ApplyValue | CloseValue | undefined> =>
			new Promise<ApplyValue | CloseValue | undefined>((resolve, reject) => {
				setResolvers({ reject, resolve });
				show();
				setAdditionalData(data);
			}),
		[show]
	);

	const handleApply = useCallback(
		(value?: ApplyValue) => {
			hide();
			resolvers?.resolve(value);
		},
		[hide, resolvers]
	);

	const handleClose = useCallback(
		(value?: CloseValue) => {
			hide();
			resolvers?.resolve(value);
		},
		[hide, resolvers]
	);

	const handleReject = useCallback(
		(value?: RejectValue) => {
			hide();
			resolvers?.reject(value);
		},
		[hide, resolvers]
	);

	const modal = useMemo(
		() =>
			open || keepMounted
				? renderModal(
						{
							onApply: handleApply,
							onClose: handleClose,
							onReject: handleReject,
							open,
						},
						additionalData
					)
				: undefined,
		[additionalData, handleApply, handleClose, handleReject, keepMounted, open, renderModal]
	);

	return [showModal, modal] as const;
};

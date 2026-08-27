import { useBoolean } from "@reactuses/core";
import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";

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
	type ModalReturnValue = ApplyValue | CloseValue | undefined;
	const resolveRef = useRef<((value: ModalReturnValue) => void) | undefined>(undefined);
	const rejectRef = useRef<((value?: RejectValue) => void) | undefined>(undefined);
	const { setFalse: hide, setTrue: show, value: open } = useBoolean(false);
	const [additionalData, setAdditionalData] = useState<AdditionalData>();

	const showModal = useCallback(
		async (data?: AdditionalData): Promise<ModalReturnValue> =>
			new Promise<ModalReturnValue>((resolve, reject) => {
				resolveRef.current = resolve;
				rejectRef.current = reject;
				show();
				setAdditionalData(data);
			}),
		[show]
	);

	const handleApply = useCallback(
		(value?: ApplyValue) => {
			hide();
			resolveRef.current?.(value);
		},
		[hide]
	);

	const handleClose = useCallback(
		(value?: CloseValue) => {
			hide();
			resolveRef.current?.(value);
		},
		[hide]
	);

	const handleReject = useCallback(
		(value?: RejectValue) => {
			hide();
			rejectRef.current?.(value);
		},
		[hide]
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

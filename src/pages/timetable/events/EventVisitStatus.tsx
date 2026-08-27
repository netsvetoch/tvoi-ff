import { Button, Flex, SegmentedRadioGroup, Skeleton, Text, useToaster } from "@gravity-ui/uikit";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import type { EventUserStatus } from "@/shared/api/timetable";

import {
	getMyEventVisitStatusEventEventIdVisitMeGetOptions,
	getMyEventVisitStatusEventEventIdVisitMeGetQueryKey,
	setEventVisitStatusEventEventIdVisitPostMutation,
} from "@/shared/api/timetable/@tanstack/react-query.gen";
import { useLoginData } from "@/shared/hooks";

import styles from "./EventInteractions.module.css";

type EditableVisitStatus = Exclude<EventUserStatus, "attended">;

interface EventVisitStatusProps {
	eventId: number;
}

const editableStatuses = new Set<EventUserStatus>(["going", "no_status", "not_going"]);

const isEditableVisitStatus = (status: EventUserStatus): status is EditableVisitStatus => editableStatuses.has(status);

export const EventVisitStatus = ({ eventId }: EventVisitStatusProps) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const toaster = useToaster();
	const { token } = useLoginData();
	const visitOptions = getMyEventVisitStatusEventEventIdVisitMeGetOptions({
		auth: token,
		path: { event_id: eventId },
	});
	const visitQuery = useQuery({ ...visitOptions, enabled: Boolean(token) });
	const visitMutation = useMutation({
		...setEventVisitStatusEventEventIdVisitPostMutation(),
		onError: () => {
			toaster.add({
				content: "Не удалось сохранить статус посещения.",
				name: "event-visit-error",
				theme: "danger",
			});
		},
		onSuccess: response => {
			queryClient.setQueryData(
				getMyEventVisitStatusEventEventIdVisitMeGetQueryKey({ auth: token, path: { event_id: eventId } }),
				{ event_id: response.event_id, status: response.status }
			);
		},
	});

	const updateStatus = (value: string) => {
		if (!token) {
			navigate({ to: "/login" });
			return;
		}

		const status = value as EventUserStatus;

		if (!isEditableVisitStatus(status) || visitMutation.isPending) {
			return;
		}

		visitMutation.mutate({ auth: token, path: { event_id: eventId }, query: { visit: status } });
	};

	return (
		<section aria-labelledby="event-visit-title" className={styles.section}>
			<Flex alignItems="flex-start" direction="column" gap={2}>
				<Text as="h2" id="event-visit-title" variant="header-2">
					Пойдёте на событие?
				</Text>
				{!token && (
					<>
						<Text color="secondary">Войдите, чтобы сохранить решение.</Text>
						<Button onClick={() => navigate({ to: "/login" })} view="outlined-action">
							Войти
						</Button>
					</>
				)}
				{token && visitQuery.isLoading && <Skeleton style={{ height: 36, width: 360 }} />}
				{token && visitQuery.isError && (
					<Flex alignItems="flex-start" direction="column" gap={2}>
						<Text color="danger">Не удалось загрузить ваш статус.</Text>
						<Button onClick={() => void visitQuery.refetch()} view="outlined">
							Повторить
						</Button>
					</Flex>
				)}
				{token && visitQuery.data && (
					<SegmentedRadioGroup
						disabled={visitMutation.isPending}
						name="event_visit_status"
						onUpdate={updateStatus}
						value={visitQuery.data.status}
					>
						<SegmentedRadioGroup.Option value="going">Пойду</SegmentedRadioGroup.Option>
						<SegmentedRadioGroup.Option value="not_going">Не пойду</SegmentedRadioGroup.Option>
						<SegmentedRadioGroup.Option value="no_status">Не решил</SegmentedRadioGroup.Option>
						<SegmentedRadioGroup.Option disabled value="attended">
							Посещено
						</SegmentedRadioGroup.Option>
					</SegmentedRadioGroup>
				)}
			</Flex>
		</section>
	);
};

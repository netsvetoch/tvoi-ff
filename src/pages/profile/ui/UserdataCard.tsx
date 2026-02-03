import { FormRow } from "@gravity-ui/components";
import { Card, Flex, spacing, Text, TextInput } from "@gravity-ui/uikit";
import { useFormContext } from "react-hook-form";

import type { UserInfo, UserInfoUpdate } from "@/shared/api/userdata";

type UserdataCardItem = UserInfo & { index: number };

interface UserdataCardProps {
	category: string;
	items: UserdataCardItem[];
	readonly?: boolean;
}

export const UserdataCard = ({ category, items, readonly }: UserdataCardProps) => {
	const { register } = useFormContext<UserInfoUpdate>();

	return (
		<Card className={spacing({ p: 3 })} style={{ overflow: "hidden" }}>
			<Text variant="subheader-2">{category}</Text>
			<Flex className={spacing({ mt: 2 })} direction="column" gap={2}>
				{items
					.filter(i => i.param !== "Фото")
					.map(({ index, param, value }) => (
						<FormRow key={param} label={param}>
							{readonly ? (
								<Flex height={28} style={{ paddingLeft: 9, paddingTop: 1.5 }}>
									<Text ellipsis style={{ lineHeight: "26px" }}>
										{value}
									</Text>
								</Flex>
							) : (
								<TextInput defaultValue={value ?? ""} {...register(`items.${index}.value`)} disabled={readonly} />
							)}
						</FormRow>
					))}
			</Flex>
		</Card>
	);
};

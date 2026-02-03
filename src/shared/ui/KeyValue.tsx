import { Flex, Text } from "@gravity-ui/uikit";

import type { ReactNode } from "react";

interface KeyValueProps {
	title: ReactNode;
	value: ReactNode;
}

export const KeyValue = ({ title, value }: KeyValueProps) => {
	return (
		<Flex>
			<Text ellipsis>{title}</Text>
			<div style={{ borderBottom: "1px dotted black", flex: 1, margin: "0 2px 4px", minWidth: 20 }} />
			<Text whiteSpace="nowrap">{value}</Text>
		</Flex>
	);
};

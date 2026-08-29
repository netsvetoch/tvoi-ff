import { Globe } from "@gravity-ui/icons";
import { Button, Flex, Text } from "@gravity-ui/uikit";

import type { ButtonGet } from "@/shared/api/services";

import styles from "./ServiceButton.module.css";

interface ServiceButtonProps {
	button: ButtonGet;
	iconUrl?: string;
	onClick: (button: ButtonGet) => void;
}

export const ServiceButton = ({ button, iconUrl, onClick }: ServiceButtonProps) => {
	const isActive = button.view === "active";

	return (
		<Button
			className={styles.tile}
			disabled={!isActive}
			onClick={() => onClick(button)}
			view={isActive ? "outlined" : "flat-secondary"}
			width="max"
		>
			<Flex alignItems="center" direction="column" gap={1} width="100%">
				{iconUrl ? <img alt="" className={styles.icon} src={iconUrl} /> : <Globe className={styles.icon} width={28} />}
				<Text ellipsis>{button.name}</Text>
			</Flex>
		</Button>
	);
};

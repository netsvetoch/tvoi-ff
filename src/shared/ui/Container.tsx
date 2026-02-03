import { Col, Flex, Row, spacing } from "@gravity-ui/uikit";

import type { PropsWithChildren, ReactNode } from "react";

interface ContainerProps extends PropsWithChildren {
	aside?: ReactNode;
}

export const Container = ({ aside, children }: ContainerProps) => {
	return (
		<Row className={spacing({ p: 3 })} space={3} style={{ maxWidth: aside ? "100%" : "1200px" }}>
			<Col size={{ l: aside ? 7 : 12, s: 12 }}>
				<Flex direction="column">{children}</Flex>
			</Col>
			{aside && (
				<Col size={{ l: 5, s: 12 }}>
					<Flex direction="column">{aside}</Flex>
				</Col>
			)}
		</Row>
	);
};

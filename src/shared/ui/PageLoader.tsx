import { Flex, Loader } from "@gravity-ui/uikit";

export const PageLoader = () => (
	<Flex alignItems={"center"} height={"100%"} justifyContent={"center"} width={"100%"}>
		<Loader size="l" />
	</Flex>
);

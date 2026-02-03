import { Card, Flex, Loader } from "@gravity-ui/uikit";
import { lazy, Suspense } from "react";

const MapComponent = lazy(async () => import("./Map").then(m => ({ default: m.MapComponent })));

export const LazyMap = () => {
	return (
		<Suspense
			fallback={
				<Card>
					<Flex alignItems="center" height={500} justifyContent="center">
						<Loader size="l" />
					</Flex>
				</Card>
			}
		>
			<MapComponent />
		</Suspense>
	);
};

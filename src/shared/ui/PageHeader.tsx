import { ActionBar } from "@gravity-ui/navigation";
import { Breadcrumbs, Flex, Skeleton, spacing } from "@gravity-ui/uikit";
import { useNavigate } from "@tanstack/react-router";
import { type ReactNode, useMemo } from "react";

interface PageHeaderProps {
	actions?: React.ReactNode;
	breadcrumbs: {
		hide?: boolean;
		href: string;
		label: ReactNode;
		loading?: boolean;
	}[];
}

export const PageHeader = (props: PageHeaderProps) => {
	const navigate = useNavigate();

	const breadcrumbs = useMemo(
		() => [
			{
				href: "/",
				label: "Главная",
			},
			...props.breadcrumbs,
		],
		[props.breadcrumbs]
	);
	return (
		<ActionBar>
			<Flex alignItems={"center"} className={spacing({ px: 3 })} justifyContent={"space-between"} width={"100%"}>
				<Breadcrumbs style={{ alignItems: "center", width: "100%" }}>
					{breadcrumbs.map(
						({ hide, href, label, loading }, index) =>
							!hide && (
								<Breadcrumbs.Item
									href={href}
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									key={index}
									onClick={e => {
										e.preventDefault();
										navigate({ href });
									}}
								>
									{loading ? <Skeleton style={{ height: 24, width: 100 }} /> : label}
								</Breadcrumbs.Item>
							)
					)}
				</Breadcrumbs>
				{props.actions}
			</Flex>
		</ActionBar>
	);
};

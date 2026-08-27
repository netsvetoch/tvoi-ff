import { Button, type ButtonButtonProps } from "@gravity-ui/uikit";
import { Skeleton } from "@gravity-ui/uikit";
import { useQuery } from "@tanstack/react-query";

import { capitalize } from "@/shared/helpers/capitalize";

import { AUTH_METHODS_MAP, type AuthMethod } from "./lib";

interface AuthButtonProps extends Omit<ButtonButtonProps, "onClick" | "type"> {
	method: AuthMethod;
}

export const AuthButton = ({ children, method, ...props }: AuthButtonProps) => {
	const { data: authUrl, isLoading } = useQuery({
		queryFn: () => AUTH_METHODS_MAP[method].getAuthUrl(),
		queryKey: AUTH_METHODS_MAP[method].getQueryKey(),
		select: data => data.data?.url,
	});

	const onClick = () => {
		if (!authUrl) {
			return;
		}

		window.open(authUrl, "_self");
	};

	if (isLoading) {
		return <Skeleton style={{ height: 40, width: 100 }} />;
	}

	return (
		<Button type="button" {...props} onClick={onClick}>
			{children ?? capitalize(method)}
		</Button>
	);
};

import { Avatar, Skeleton } from "@gravity-ui/uikit";

import { stringToColor } from "@/shared/helpers/stringToColor";

import type { CSSProperties } from "react";

interface ProfileAvatarProps {
	className?: string;
	imgUrl: string;
	loading?: boolean;
	name: string;
	style?: CSSProperties;
}

export const ProfileAvatar = ({ className, imgUrl, loading, name, style }: ProfileAvatarProps) => {
	if (loading) {
		return (
			<Skeleton
				className={className}
				style={{
					borderRadius: 999,
					display: "flex",
					height: "clamp(100px, 50vw, 200px)",
					width: "clamp(100px, 50vw, 200px)",
					...style,
				}}
			/>
		);
	}

	return (
		<Avatar
			className={className}
			fallbackImgUrl={`https://ui-avatars.com/api/?name=${name.replace("@", "").slice(0, 2).toUpperCase()}&background=${stringToColor(name)}&color=fff`}
			imgUrl={imgUrl}
			style={{ height: "clamp(100px, 50vw, 200px)", width: "clamp(100px, 50vw, 200px)", ...style }}
		/>
	);
};

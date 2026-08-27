import type { CSSProperties } from "react";

import { Avatar, Skeleton } from "@gravity-ui/uikit";

import { stringToColor } from "@/shared/helpers/stringToColor";

interface ProfileAvatarProps {
	className?: string;
	imgUrl?: string;
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

	const avatarStyle = { height: "clamp(100px, 50vw, 200px)", width: "clamp(100px, 50vw, 200px)", ...style };

	if (!imgUrl) {
		return <Avatar className={className} style={avatarStyle} text={name || "?"} />;
	}

	const initials = (name || "?")
		.replace("@", "")
		.split(/\s+/)
		.map(part => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase()
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");
	const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="#${stringToColor(name)}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="72">${initials}</text></svg>`;

	return (
		<Avatar
			className={className}
			fallbackImgUrl={`data:image/svg+xml,${encodeURIComponent(fallbackSvg)}`}
			imgUrl={imgUrl}
			style={avatarStyle}
		/>
	);
};

import {
	ArrowRightToSquare,
	Gear,
	Heart,
	LayoutHeaderCellsLarge,
	MapPin,
	Person,
	Persons,
	Printer,
	ShoppingBasket,
} from "@gravity-ui/icons";
import { UnableToDisplay } from "@gravity-ui/illustrations";
import { AsideHeader, FooterItem, MobileHeader, MobileHeaderFooterItem } from "@gravity-ui/navigation";
import { Flex, Sheet, Text, ToasterComponent } from "@gravity-ui/uikit";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { useLoginData, useMobile } from "@/shared/hooks";

import styles from "./Layout.module.css";
import { Settings } from "./ui";

const logo = {
	iconClassName: styles.icon,
	iconSrc: "/icon.svg",
	text: "Твой ФФ!",
};

const renderContent = () => (
	<ErrorBoundary
		fallback={
			<Flex alignItems={"center"} direction={"column"} gap={2} height={"100%"} justifyContent={"center"}>
				<UnableToDisplay />
				<Text variant="header-1">Something went wrong</Text>
			</Flex>
		}
	>
		<Flex direction={"column"} style={{ containerType: "inline-size", height: "100%", maxHeight: "100%" }}>
			<Outlet />
		</Flex>
		<ToasterComponent />
	</ErrorBoundary>
);

export const Layout = () => {
	const navigate = useNavigate();

	const location = useLocation();

	const [compact, setCompact] = useState(false);
	const [showSettings, setShowSettings] = useState(false);

	const loginData = useLoginData();

	const isMobile = useMobile();

	const items = useMemo(
		() => [
			{
				current: !showSettings && location.pathname.startsWith("/timetable"),
				icon: LayoutHeaderCellsLarge,
				id: "timetable",
				onItemClick: () => {
					setShowSettings(false);
					navigate({ to: "/timetable" });
				},
				title: "Расписание",
			},
			{
				current: !showSettings && location.pathname.startsWith("/map"),
				icon: MapPin,
				id: "map",
				onItemClick: () => {
					setShowSettings(false);
					navigate({ to: "/map" });
				},
				title: "Схема этажей",
			},
			{
				current: !showSettings && location.pathname.startsWith("/printer"),
				icon: Printer,
				id: "printer",
				onItemClick: () => {
					setShowSettings(false);
					navigate({ to: "/printer" });
				},
				title: "Принтер",
			},
			{
				current: !showSettings && location.pathname.startsWith("/rental"),
				icon: ShoppingBasket,
				id: "rental",
				onItemClick: () => {
					setShowSettings(false);
					navigate({ to: "/rental" });
				},
				title: "Прокат",
			},
			{
				current: !showSettings && location.pathname.startsWith("/rating"),
				icon: Persons,
				id: "rating",
				onItemClick: () => {
					setShowSettings(false);
					navigate({ to: "/rating" });
				},
				title: "Дубинушка",
			},
			{
				current: !showSettings && location.pathname.startsWith("/dating"),
				icon: Heart,
				id: "dating",
				onItemClick: () => {
					setShowSettings(false);
					navigate({ to: "/dating" });
				},
				title: "Знакомства",
			},
		],
		[navigate, showSettings, location.pathname]
	);

	const renderFooter = useCallback(
		() => (
			<>
				<FooterItem
					compact={compact}
					current={showSettings}
					icon={Gear}
					id="settings"
					onItemClick={() => setShowSettings(prev => !prev)}
					title="Настройки"
				/>
				{loginData ? (
					<FooterItem
						compact={compact}
						current={!showSettings && location.pathname.startsWith("/profile")}
						icon={Person}
						id="profile"
						onItemClick={() => {
							setShowSettings(false);
							navigate({ to: "/profile" });
						}}
						title="Профиль"
					/>
				) : (
					<FooterItem
						compact={compact}
						current={location.pathname.startsWith("/login")}
						icon={ArrowRightToSquare}
						id="login"
						onItemClick={() => {
							setShowSettings(false);
							navigate({ to: "/login" });
						}}
						title="Вход / Регистрация"
					/>
				)}
			</>
		),
		[loginData, compact, navigate, showSettings, location.pathname]
	);

	const renderMobileFooter = useCallback(
		() => (
			<>
				<MobileHeaderFooterItem icon={Gear} onClick={() => setShowSettings(prev => !prev)} />
				{loginData ? (
					<MobileHeaderFooterItem icon={Person} onClick={() => navigate({ to: "/profile" })} />
				) : (
					<MobileHeaderFooterItem icon={ArrowRightToSquare} onClick={() => navigate({ to: "/login" })} />
				)}
			</>
		),
		[loginData, navigate, setShowSettings]
	);

	const panelItems = useMemo(
		() => [{ children: <Settings />, id: "kek", open: showSettings, size: "auto" as const }],
		[showSettings]
	);

	if (isMobile) {
		return (
			<>
				<MobileHeader
					burgerMenu={{
						items,
						renderFooter: renderMobileFooter,
					}}
					className={styles.mobileHeader}
					contentClassName={styles.content}
					logo={logo}
					onClosePanel={() => setShowSettings(false)}
					panelItems={panelItems}
					renderContent={renderContent}
				/>
				<Sheet onClose={() => setShowSettings(false)} visible={showSettings}>
					<Settings />
				</Sheet>
			</>
		);
	}

	return (
		<AsideHeader
			compact={compact}
			logo={logo}
			menuItems={items}
			onChangeCompact={setCompact}
			onClosePanel={() => setShowSettings(false)}
			panelItems={panelItems}
			renderContent={renderContent}
			renderFooter={renderFooter}
		/>
	);
};

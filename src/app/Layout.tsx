import { ArrowRightToSquare, Gear, LayoutHeaderCellsLarge, MapPin, Person, Persons, Printer } from "@gravity-ui/icons";
import { UnableToDisplay } from "@gravity-ui/illustrations";
import { AsideHeader, FooterItem, MobileHeader, MobileHeaderFooterItem } from "@gravity-ui/navigation";
import { Flex, Sheet, Text, ToasterComponent } from "@gravity-ui/uikit";
import { useCallback, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useLocalStorage } from "usehooks-ts";

import { useMobile } from "@/shared/hooks";

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

	const [loginData] = useLocalStorage("login_data", undefined);

	const isMobile = useMobile();

	const items = useMemo(
		() => [
			{
				current: !showSettings && location.pathname.startsWith("/timetable"),
				icon: LayoutHeaderCellsLarge,
				id: "timetable",
				onItemClick: () => {
					setShowSettings(false);
					navigate("/timetable");
				},
				title: "Расписание",
			},
			{
				current: !showSettings && location.pathname.startsWith("/map"),
				icon: MapPin,
				id: "map",
				onItemClick: () => {
					setShowSettings(false);
					navigate("/map");
				},
				title: "Схема этажей",
			},
			{
				current: !showSettings && location.pathname.startsWith("/printer"),
				icon: Printer,
				id: "printer",
				onItemClick: () => {
					setShowSettings(false);
					navigate("/printer");
				},
				title: "Принтер",
			},
			{
				current: !showSettings && location.pathname.startsWith("/rating"),
				icon: Persons,
				id: "rating",
				onItemClick: () => {
					setShowSettings(false);
					navigate("/rating");
				},
				title: "Дубинушка",
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
							navigate("/profile");
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
							navigate("/login");
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
					<MobileHeaderFooterItem icon={Person} onClick={() => navigate("/profile")} />
				) : (
					<MobileHeaderFooterItem icon={ArrowRightToSquare} onClick={() => navigate("/login")} />
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

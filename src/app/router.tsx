import { createHashHistory, createRootRoute, createRoute, createRouter, redirect } from "@tanstack/react-router";

import { DatingPage, DatingProfilePage } from "@/pages/dating";
import { LoginPage } from "@/pages/login";
import { MapPage } from "@/pages/map";
import { PrinterLoginPage, PrinterPage } from "@/pages/printer";
import { checkPrinterAvailable } from "@/pages/printer/helpers";
import { ProfilePage } from "@/pages/profile";
import { LecturerRatingPage, RatingPage } from "@/pages/rating";
import { RentalCatalogPage, RentalMyPage } from "@/pages/rental";
import { ServicesPage, ServiceViewPage } from "@/pages/services";
import {
	TimetableEventPage,
	TimetableEventsPage,
	TimetableGroupPage,
	TimetableGroupsPage,
	TimetableLecturerPage,
	TimetableLecturersPage,
	TimetableRoomPage,
	TimetableRoomsPage,
} from "@/pages/timetable";
import { approveEmailEmailApproveGet } from "@/shared/api/auth";
import { parseTimetableDaysParam } from "@/shared/helpers";
import { isAuthorized } from "@/shared/hooks";
import { PageLoader } from "@/shared/ui";

import { Layout } from "./Layout";

const optionalString = (value: unknown) => (typeof value === "string" ? value : undefined);

const scheduleSearchParams = (search: Record<string, unknown>): { date?: string; days?: 1 | 3 | 7 } => ({
	date: optionalString(search.date),
	days: parseTimetableDaysParam(search.days),
});

const rootRoute = createRootRoute({
	component: Layout,
	notFoundComponent: () => null,
});

const indexRoute = createRoute({
	beforeLoad: () => {
		throw redirect({ to: "/timetable/groups" });
	},
	getParentRoute: () => rootRoute,
	path: "/",
});

const loginRoute = createRoute({
	beforeLoad: () => {
		if (isAuthorized()) {
			throw redirect({ to: "/profile" });
		}
	},
	component: LoginPage,
	getParentRoute: () => rootRoute,
	path: "login",
	validateSearch: (search: Record<string, unknown>): { result?: "error" | "success" } => ({
		result: search.result === "error" || search.result === "success" ? search.result : undefined,
	}),
});

const profileRoute = createRoute({
	beforeLoad: () => {
		if (!isAuthorized()) {
			throw redirect({ to: "/login" });
		}
	},
	component: ProfilePage,
	getParentRoute: () => rootRoute,
	path: "profile",
});

const timetableRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "timetable",
});

const timetableIndexRoute = createRoute({
	beforeLoad: () => {
		throw redirect({ to: "/timetable/groups" });
	},
	getParentRoute: () => timetableRoute,
	path: "/",
});

const groupsRoute = createRoute({
	getParentRoute: () => timetableRoute,
	path: "groups",
});

const groupsIndexRoute = createRoute({
	component: TimetableGroupsPage,
	getParentRoute: () => groupsRoute,
	path: "/",
});

const groupRoute = createRoute({
	component: TimetableGroupPage,
	getParentRoute: () => groupsRoute,
	path: "$id",
	validateSearch: scheduleSearchParams,
});

const eventsRoute = createRoute({
	getParentRoute: () => timetableRoute,
	path: "events",
});

const eventsIndexRoute = createRoute({
	component: TimetableEventsPage,
	getParentRoute: () => eventsRoute,
	path: "/",
	validateSearch: (
		search: Record<string, unknown>
	): { date?: string; days?: 1 | 3 | 7; groupId?: string; lecturerId?: string; roomId?: string } => ({
		...scheduleSearchParams(search),
		groupId: optionalString(search.groupId),
		lecturerId: optionalString(search.lecturerId),
		roomId: optionalString(search.roomId),
	}),
});

const eventRoute = createRoute({
	component: TimetableEventPage,
	getParentRoute: () => eventsRoute,
	path: "$id",
});

const roomsRoute = createRoute({
	getParentRoute: () => timetableRoute,
	path: "rooms",
});

const roomsIndexRoute = createRoute({
	component: TimetableRoomsPage,
	getParentRoute: () => roomsRoute,
	path: "/",
});

const roomRoute = createRoute({
	component: TimetableRoomPage,
	getParentRoute: () => roomsRoute,
	path: "$id",
	validateSearch: scheduleSearchParams,
});

const lecturersRoute = createRoute({
	getParentRoute: () => timetableRoute,
	path: "lecturers",
});

const lecturersIndexRoute = createRoute({
	component: TimetableLecturersPage,
	getParentRoute: () => lecturersRoute,
	path: "/",
});

const lecturerRoute = createRoute({
	component: TimetableLecturerPage,
	getParentRoute: () => lecturersRoute,
	path: "$id",
	validateSearch: scheduleSearchParams,
});

const ratingRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "rating",
});

const ratingIndexRoute = createRoute({
	component: RatingPage,
	getParentRoute: () => ratingRoute,
	path: "/",
});

const lecturerRatingRoute = createRoute({
	component: LecturerRatingPage,
	getParentRoute: () => ratingRoute,
	path: "lecturer/$id",
});

const datingRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "dating",
});

const datingIndexRoute = createRoute({
	component: DatingPage,
	getParentRoute: () => datingRoute,
	path: "/",
});

const datingProfileRoute = createRoute({
	component: DatingProfilePage,
	getParentRoute: () => datingRoute,
	path: "$id",
});

const rentalRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "rental",
});

const rentalIndexRoute = createRoute({
	component: RentalCatalogPage,
	getParentRoute: () => rentalRoute,
	path: "/",
});

const rentalMyRoute = createRoute({
	beforeLoad: () => {
		if (!isAuthorized()) {
			throw redirect({ to: "/login" });
		}
	},
	component: RentalMyPage,
	getParentRoute: () => rentalRoute,
	path: "my",
});

const servicesRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "services",
});

const servicesIndexRoute = createRoute({
	component: ServicesPage,
	getParentRoute: () => servicesRoute,
	path: "/",
});

const serviceViewRoute = createRoute({
	component: ServiceViewPage,
	getParentRoute: () => servicesRoute,
	path: "$buttonId",
});

const mapRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "map",
});

const mapIndexRoute = createRoute({
	beforeLoad: () => {
		throw redirect({ params: { floor: "5" }, to: "/map/$floor" });
	},
	getParentRoute: () => mapRoute,
	path: "/",
});

const mapFloorRoute = createRoute({
	component: MapPage,
	getParentRoute: () => mapRoute,
	path: "$floor",
});

const mapRoomRoute = createRoute({
	component: MapPage,
	getParentRoute: () => mapFloorRoute,
	path: "$roomName",
});

const printerRoute = createRoute({
	beforeLoad: () => {
		if (!isAuthorized()) {
			throw redirect({ to: "/login" });
		}
	},
	getParentRoute: () => rootRoute,
	path: "printer",
});

const printerIndexRoute = createRoute({
	beforeLoad: async () => {
		const isAvailable = await checkPrinterAvailable();

		if (!isAvailable) {
			throw redirect({ to: "/printer/login" });
		}
	},
	component: PrinterPage,
	getParentRoute: () => printerRoute,
	path: "/",
});

const printerLoginRoute = createRoute({
	component: PrinterLoginPage,
	getParentRoute: () => printerRoute,
	path: "login",
});

const emailApproveRoute = createRoute({
	beforeLoad: async ({ search }) => {
		const token = search.token;

		if (!token) {
			throw redirect({ search: { result: "error" }, to: "/login" });
		}

		const { error } = await approveEmailEmailApproveGet({ query: { token } });

		if (error) {
			throw redirect({ search: { result: "error" }, to: "/login" });
		}

		throw redirect({ search: { result: "success" }, to: "/login" });
	},
	getParentRoute: () => rootRoute,
	path: "auth/register/success",
	validateSearch: (search: Record<string, unknown>): { token?: string } => ({
		token: optionalString(search.token),
	}),
});

const routeTree = rootRoute.addChildren([
	indexRoute,
	loginRoute,
	profileRoute,
	emailApproveRoute,
	timetableRoute.addChildren([
		timetableIndexRoute,
		groupsRoute.addChildren([groupsIndexRoute, groupRoute]),
		eventsRoute.addChildren([eventsIndexRoute, eventRoute]),
		roomsRoute.addChildren([roomsIndexRoute, roomRoute]),
		lecturersRoute.addChildren([lecturersIndexRoute, lecturerRoute]),
	]),
	ratingRoute.addChildren([ratingIndexRoute, lecturerRatingRoute]),
	datingRoute.addChildren([datingIndexRoute, datingProfileRoute]),
	rentalRoute.addChildren([rentalIndexRoute, rentalMyRoute]),
	servicesRoute.addChildren([servicesIndexRoute, serviceViewRoute]),
	mapRoute.addChildren([mapIndexRoute, mapFloorRoute.addChildren([mapRoomRoute])]),
	printerRoute.addChildren([printerIndexRoute, printerLoginRoute]),
]);

export const router = createRouter({
	defaultPendingComponent: PageLoader,
	defaultPendingMs: 0,
	history: createHashHistory(),
	routeTree,
});

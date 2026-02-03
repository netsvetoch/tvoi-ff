import { createHashRouter, createRoutesFromElements, redirect, Route } from "react-router";

import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/login";
import { MapPage } from "@/pages/map";
import { PrinterLoginPage, PrinterPage } from "@/pages/printer";
import { checkPrinterAvailable } from "@/pages/printer/helpers/checkPrinterAvailable";
import { ProfilePage } from "@/pages/profile";
import { LecturerRatingPage, RatingPage } from "@/pages/rating";
import {
	TimetableEventPage,
	TimetableEventsPage,
	TimetableGroupPage,
	TimetableGroupsPage,
	TimetableLecturerPage,
	TimetableRoomPage,
} from "@/pages/timetable";
import { approveEmailEmailApproveGet } from "@/shared/api/auth";

import { Layout } from "./Layout";

export const router = createHashRouter(
	createRoutesFromElements(
		<Route element={<Layout />} path="*">
			<Route
				loader={({ params, request }) => {
					const { method } = params;
					const url = new URL(request.url);
					url.searchParams.set("method", method ?? "");

					return redirect(`/login?${url.searchParams.toString()}`);
				}}
				path="auth/oauth-authorized/:method"
			/>
			<Route element={<HomePage />} loader={() => redirect("/timetable/groups")} path="" />

			<Route
				element={<LoginPage />}
				loader={() => (localStorage.getItem("login_data") ? redirect("/profile") : undefined)}
				path="login"
			/>
			<Route
				element={<ProfilePage />}
				loader={() => (localStorage.getItem("login_data") ? undefined : redirect("/login"))}
				path="profile"
			/>
			<Route path="timetable">
				<Route loader={() => redirect("/timetable/groups")} path="" />

				<Route path="groups">
					<Route element={<TimetableGroupsPage />} path="" />
					<Route element={<TimetableGroupPage />} path=":groupId" />
				</Route>

				<Route path="events">
					<Route element={<TimetableEventsPage />} path="" />
					<Route element={<TimetableEventPage />} path=":eventId" />
				</Route>

				<Route path="rooms">
					<Route element={<TimetableRoomPage />} path=":roomId" />
				</Route>

				<Route path="lecturers">
					<Route element={<TimetableLecturerPage />} path=":lecturerId" />
				</Route>
			</Route>

			<Route path="rating">
				<Route element={<RatingPage />} path="" />
				<Route element={<LecturerRatingPage />} path="lecturer/:lecturerId" />
			</Route>

			<Route path="map">
				<Route loader={() => redirect("/map/5")} path="" />
				<Route element={<MapPage />} path=":floor">
					<Route element={<MapPage />} path=":roomName" />
				</Route>
			</Route>

			<Route path="printer">
				<Route
					element={<PrinterPage />}
					loader={async () => {
						const isAvailable = await checkPrinterAvailable();

						return isAvailable ? undefined : redirect("/printer/login");
					}}
					path=""
				/>
				<Route
					element={<PrinterLoginPage />}
					loader={async () => {
						const loginData = localStorage.getItem("login_data");

						if (!loginData) {
							return redirect("/login");
						}

						const isAvailable = await checkPrinterAvailable();

						return isAvailable ? redirect("/printer") : undefined;
					}}
					path="login"
				/>
			</Route>

			<Route
				loader={async ({ request }) => {
					const url = new URL(request.url);
					const token = url.searchParams.get("token");

					if (!token) {
						return redirect("/login?result=error");
					}

					const { error } = await approveEmailEmailApproveGet({ query: { token } });

					if (error) {
						return redirect("/login?result=error");
					}

					return redirect("/login?result=success");
				}}
				path="auth/register/success"
			/>
		</Route>
	)
);

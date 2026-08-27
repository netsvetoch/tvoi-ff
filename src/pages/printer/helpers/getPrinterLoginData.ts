import { getUserInfoUserIdGet } from "@/shared/api/userdata";
import { getLoginData } from "@/shared/hooks";

export const getPrinterLoginData = async () => {
	const loginData = getLoginData();

	if (!loginData?.token) {
		return undefined;
	}

	const { data } = await getUserInfoUserIdGet({
		auth: loginData.token,
		path: { id: loginData.user_id },
	});

	const surname = data?.items.find(item => item.param === "Фамилия")?.value;
	const number = data?.items.find(item => item.param === "Номер профсоюзного билета")?.value;

	return { number, surname };
};

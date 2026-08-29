import { useLocalStorage, type UseLocalStorageSerializer } from "@reactuses/core";

import type { AuthBackendAuthMethodSessionSession } from "../api/auth";

const LOGIN_DATA_KEY = "login_data";

type LoginData = AuthBackendAuthMethodSessionSession;

const parseLoginData = (raw: null | string): LoginData | null => {
	if (raw === null) {
		return null;
	}

	try {
		return JSON.parse(raw) as LoginData;
	} catch {
		return null;
	}
};

export const getLoginData = (): LoginData | null => {
	return parseLoginData(localStorage.getItem(LOGIN_DATA_KEY));
};

export const isAuthorized = (): boolean => {
	return Boolean(getLoginData()?.token);
};

const loginDataSerializer: UseLocalStorageSerializer<LoginData | null> = {
	read: raw => parseLoginData(raw),
	write: value => JSON.stringify(value),
};

export const useLoginData = () => {
	const [loginData, setLoginData] = useLocalStorage<LoginData | null>(LOGIN_DATA_KEY, null, {
		serializer: loginDataSerializer,
	});

	return { ...loginData, removeLoginData: () => setLoginData(null), setLoginData };
};

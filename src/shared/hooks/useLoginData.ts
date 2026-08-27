import { useLocalStorage } from "@reactuses/core";

import type { AuthBackendAuthMethodSessionSession } from "../api/auth";

export const useLoginData = () => {
	const [loginData, setLoginData] = useLocalStorage<AuthBackendAuthMethodSessionSession>("login_data", null);

	return { ...loginData, removeLoginData: () => setLoginData(null), setLoginData };
};

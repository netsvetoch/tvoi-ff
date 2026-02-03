import {
	authUrlAuthenticAuthUrlGet,
	authUrlGithubAuthUrlGet,
	authUrlGoogleAuthUrlGet,
	authUrlLkMsuAuthUrlGet,
	authUrlMyMsuAuthUrlGet,
	authUrlPhysicsMsuAuthUrlGet,
	// authUrlTelegramAuthUrlGet,
	authUrlVkAuthUrlGet,
	authUrlYandexAuthUrlGet,
	loginAuthenticLoginPost,
	loginGithubLoginPost,
	loginGoogleLoginPost,
	loginLkMsuLoginPost,
	loginMyMsuLoginPost,
	loginPhysicsMsuLoginPost,
	// loginTelegramLoginPost,
	loginVkLoginPost,
	loginYandexLoginPost,
	registerAuthenticRegistrationPost,
	registerGithubRegistrationPost,
	registerGoogleRegistrationPost,
	registerLkMsuRegistrationPost,
	registerMyMsuRegistrationPost,
	registerPhysicsMsuRegistrationPost,
	// registerTelegramRegistrationPost,
	registerVkRegistrationPost,
	registerYandexRegistrationPost,
} from "@/shared/api/auth";
import {
	authUrlAuthenticAuthUrlGetQueryKey,
	authUrlGithubAuthUrlGetQueryKey,
	authUrlGoogleAuthUrlGetQueryKey,
	authUrlLkMsuAuthUrlGetQueryKey,
	authUrlMyMsuAuthUrlGetQueryKey,
	authUrlPhysicsMsuAuthUrlGetQueryKey,
	// authUrlTelegramAuthUrlGetQueryKey,
	authUrlVkAuthUrlGetQueryKey,
	authUrlYandexAuthUrlGetQueryKey,
} from "@/shared/api/auth/@tanstack/react-query.gen";

export const AUTH_METHODS_MAP = Object.freeze({
	authentic: {
		getAuthUrl: authUrlAuthenticAuthUrlGet,
		getQueryKey: authUrlAuthenticAuthUrlGetQueryKey,
		login: loginAuthenticLoginPost,
		register: registerAuthenticRegistrationPost,
	},
	github: {
		getAuthUrl: authUrlGithubAuthUrlGet,
		getQueryKey: authUrlGithubAuthUrlGetQueryKey,
		login: loginGithubLoginPost,
		register: registerGithubRegistrationPost,
	},
	google: {
		getAuthUrl: authUrlGoogleAuthUrlGet,
		getQueryKey: authUrlGoogleAuthUrlGetQueryKey,
		login: loginGoogleLoginPost,
		register: registerGoogleRegistrationPost,
	},
	"lk-msu": {
		getAuthUrl: authUrlLkMsuAuthUrlGet,
		getQueryKey: authUrlLkMsuAuthUrlGetQueryKey,
		login: loginLkMsuLoginPost,
		register: registerLkMsuRegistrationPost,
	},
	"my-msu": {
		getAuthUrl: authUrlMyMsuAuthUrlGet,
		getQueryKey: authUrlMyMsuAuthUrlGetQueryKey,
		login: loginMyMsuLoginPost,
		register: registerMyMsuRegistrationPost,
	},
	"physics-msu": {
		getAuthUrl: authUrlPhysicsMsuAuthUrlGet,
		getQueryKey: authUrlPhysicsMsuAuthUrlGetQueryKey,
		login: loginPhysicsMsuLoginPost,
		register: registerPhysicsMsuRegistrationPost,
	},
	// telegram: {
	// 	getAuthUrl: authUrlTelegramAuthUrlGet,
	// 	getQueryKey: authUrlTelegramAuthUrlGetQueryKey,
	// 	login: loginTelegramLoginPost,
	// 	register: registerTelegramRegistrationPost,
	// },
	vk: {
		getAuthUrl: authUrlVkAuthUrlGet,
		getQueryKey: authUrlVkAuthUrlGetQueryKey,
		login: loginVkLoginPost,
		register: registerVkRegistrationPost,
	},
	yandex: {
		getAuthUrl: authUrlYandexAuthUrlGet,
		getQueryKey: authUrlYandexAuthUrlGetQueryKey,
		login: loginYandexLoginPost,
		register: registerYandexRegistrationPost,
	},
});

export type AuthMethod = keyof typeof AUTH_METHODS_MAP;

export const AUTH_METHODS_LIST = Object.keys(AUTH_METHODS_MAP) as AuthMethod[];

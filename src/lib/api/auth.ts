import type {App} from "./types";
import {currentUser, telegram} from "../telegram";
import {internalRequest} from "./base";

export const sessionStore = {
    appList: [] as App[],
    currentJWT: '',
    langPack: {} as Record<string, string>,
    langCode: '',
    maxFreeLinks: 0,
    maxPremiumLinks: 0,
    maxFollowingLinks: 0,
};

export async function tryLogin() {
    let response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ initData: telegram.initData }),
    });
    if (!response.ok) {
        return false;
    }
    const data = await response.json();
    if (data.token) {
        sessionStore.currentJWT = data.token;
        const userResponse = await internalRequest<App[], null>(
            "users/links"
        );
        if (userResponse.error) {
            return false;
        }
        sessionStore.appList = userResponse.response || [];
        const langPackResponse = await internalRequest<{
            lang_code: string;
            strings: Record<string, string>;
        }, null>(
            `langpack?lang_code_hint=${currentUser.language_code}`
        );
        if (langPackResponse.error) {
            return false;
        }
        sessionStore.langPack = langPackResponse.response?.strings || {};
        sessionStore.langCode = langPackResponse.response?.lang_code || '';

        const getConfigResponse = await internalRequest<{
            limit_free: number;
            limit_premium: number;
            max_following_links: number;
        }, null>('get_config');

        if (getConfigResponse.error) {
            return false;
        }

        sessionStore.maxFreeLinks = getConfigResponse.response?.limit_free!;
        sessionStore.maxPremiumLinks = getConfigResponse.response?.limit_premium!;
        sessionStore.maxFollowingLinks = getConfigResponse.response?.max_following_links!;
        return true;
    }
    return false;
}
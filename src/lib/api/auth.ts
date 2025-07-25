import type {App} from "./types";
import {currentUser, telegram} from "../telegram";
import {internalRequest} from "./base";

export const sessionStore = {
    linksList: [] as App[],
    currentJWT: '',
    langPack: {} as Record<string, string>,
    langCode: '',
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
        sessionStore.linksList = userResponse.response || [];
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
        return true;
    }
    return false;
}
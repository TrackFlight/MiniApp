import type {Link} from "./types";
import {currentUser, telegram} from "../telegram";
import {internalRequest} from "./base";

export const sessionStore = {
    linksList: [] as Link[],
    currentJWT: null as string | null,
    langPack: {} as Record<string, string>,
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
        const userResponse = await internalRequest<Link[], null>(
            "users/links"
        );
        if (userResponse.error) {
            return false;
        }
        sessionStore.linksList = userResponse.response || [];
        const langPackResponse = await internalRequest<Record<string, string>, null>(
            `langpack/strings?languageHint=${currentUser.language_code}`
        );
        if (langPackResponse.error) {
            return false;
        }
        sessionStore.langPack = langPackResponse.response || {};
        return true;
    }
    return false;
}
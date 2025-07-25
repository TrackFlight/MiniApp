import {type App, type Link, ServerErrorCode} from "./types";
import {sessionStore} from "./auth";
import {internalRequest} from "./base";

export async function trackLink(url_or_id: string | number) : Promise<ServerErrorCode | null> {
    let trackLinkData: {
        id?: number,
        link?: string,
    };

    if (typeof url_or_id === "number") {
        trackLinkData = { id: url_or_id };
    } else {
        trackLinkData = { link: url_or_id };
    }

    let res = await internalRequest<App, typeof trackLinkData>(
        "users/links",
        "POST",
        trackLinkData
    );
    if (res.error === undefined) {
        sessionStore.linksList = sessionStore.linksList
            .reduce<{ items: App[]; found: boolean }>((acc, app, idx, arr) => {
                if (app.id === res.response?.id) {
                    acc.items.push({ ...app, links: [...app.links, ...res.response?.links] });
                    acc.found = true;
                } else {
                    acc.items.push(app);
                }
                if (idx === arr.length - 1 && !acc.found) {
                    acc.items.push(res.response!);
                }
                return acc;
            }, { items: [] as App[], found: false }).items
    } else {
        return res.error.code;
    }
    return null;
}

export async function removeApp(app_id: number) {
    const appInfo = sessionStore.linksList
        .find((link) => link.id === app_id)!
        .links.
        flatMap(link => link.id);
    await internalRequest(
        `users/links`,
        "DELETE",
        appInfo,
    );
    sessionStore.linksList = sessionStore.linksList.filter(link => link.id !== app_id);
}
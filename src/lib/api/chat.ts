import {type App, type Link, ServerErrorCode} from "./types";
import {sessionStore} from "./auth";
import {getAppID, internalRequest} from "./base";

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
        sessionStore.appList = sessionStore.appList
            .reduce<{ items: App[]; found: boolean }>((acc, app, idx, arr) => {
                if (getAppID(app) === getAppID(res.response!)) {
                    acc.items.push({ ...app, links: [...app.links, ...res.response!.links] });
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

export async function removeApp(app: App) {
    const appInfo = app.links.flatMap(link => link.id);
    await internalRequest(
        `users/links`,
        "DELETE",
        appInfo,
    );
    sessionStore.appList = sessionStore.appList.filter(item => getAppID(item) !== getAppID(app));
}
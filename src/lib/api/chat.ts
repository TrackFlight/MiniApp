import {type App, type Link, ServerErrorCode} from "./types";
import {sessionStore} from "./auth";
import {internalRequest} from "./base";

export async function trackLink(url_or_id: string | number) : Promise<ServerErrorCode | null> {
    let trackLinkData: {
        id?: number,
        link?: string,
    };
    if (sessionStore.appList.reduce((acc, app) => acc + app.links.length, 0) >= sessionStore.maxFollowingLinks) {
        return ServerErrorCode.LimitExceeded;
    }

    if (typeof url_or_id === "number") {
        trackLinkData = { id: url_or_id };
    } else {
        const existingApp = sessionStore.appList.find(
            app => app.links.some(
                link => link.url === url_or_id.replace(/https?:\/\//, '')
            )
        );
        if (existingApp) {
            return ServerErrorCode.LinkAlreadyFollowing;
        }
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
                if (app.id === res.response!.id) {
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
    const linkIDs = app.links.flatMap(link => link.id);
    await internalRequest(
        `users/links`,
        "DELETE",
        linkIDs,
    );
    sessionStore.appList = sessionStore.appList.filter(item => item.id !== app.id);
}

export async function updateLinkPreferences(link: Link) {
    await internalRequest(
        `users/links/${link.id}`,
        "PATCH",
        {
            notify_available: link.notify_available,
            notify_closed: link.notify_closed
        }
    );
    sessionStore.appList = sessionStore.appList.reduce<App[]>((acc, app) => {
        acc.push({
            ...app,
            links: app.links.map(l => {
                if (l.id === link.id) {
                    return {
                        ...l,
                        notify_available: link.notify_available,
                        notify_closed: link.notify_closed
                    };
                }
                return l;
            })
        });
        return acc;
    }, []);
}

export async function removeLink(link: Link) {
    await internalRequest(
        `users/links`,
        "DELETE",
        [link.id],
    );
    sessionStore.appList = sessionStore.appList
        .map(app => ({
            ...app,
            links: app.links.filter(l => l.id !== link.id)
        }))
        .filter(app => app.links.length > 0);
}
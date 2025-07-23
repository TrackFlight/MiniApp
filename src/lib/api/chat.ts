import {type Link, ServerErrorCode} from "./types";
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

    let res = await internalRequest<Link, typeof trackLinkData>(
        "users/links",
        "POST",
        trackLinkData
    );
    if (res.error === undefined) {
        sessionStore.linksList = [...sessionStore.linksList, res.response!];
    } else {
        return res.error.code;
    }
    return null;
}

export async function removeLink(linkId: number) {
    await internalRequest<null, null>(
        `users/links/${linkId}`,
        "DELETE"
    );
    sessionStore.linksList = sessionStore.linksList.filter(link => link.id !== linkId);
}
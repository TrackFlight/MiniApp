import {currentUser, telegram} from "./telegram";

let currentJWT: string | null = null;
export let linksList: Link[];
export let langPack: Record<string, string> = {};

export interface Link {
    id: number;
    tag: string;
    app_name: string;
    icon_url: string;
    description: string;
    status: "available" | "full" | "closed";
    last_availability: number;
}

type ResponseData<T> = {
    response?: T | null;
    error?: ErrorResponse;
}

interface ErrorResponse {
    code: string;
    message: string;
    seconds?: number;
}

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
        currentJWT = data.token;
        const userResponse = await internalRequest<Link[]>(
            "users/links"
        );
        if (userResponse.error) {
            return false;
        }
        linksList = userResponse.response || [];
        const langPackResponse = await internalRequest<Record<string, string>>(
            `langpack/strings?languageHint=${currentUser.language_code}`
        );
        if (langPackResponse.error) {
            return false;
        }
        langPack = langPackResponse.response || {};
        return true;
    }
    return false;
}

export async function withUIProgress<T>(promise: Promise<ResponseData<T>>): Promise<ResponseData<T>> {
    let res = await withTimeout(promise, () => {
        telegram.showLoadingProgress(true);
    });
    telegram.showLoadingProgress(false);
    return res;
}

export async function withTimeout<T>(
    promise: Promise<ResponseData<T>>,
    onTimeout: () => void
): Promise<ResponseData<T>> {
    let timeoutId: ReturnType<typeof setTimeout>;

    const timeoutPromise = new Promise<ResponseData<T>>((_) => {
        timeoutId = setTimeout(() => {
            if (onTimeout) onTimeout();
        }, 200);
    });

    return Promise.race([
        promise.finally(() => clearTimeout(timeoutId)),
        timeoutPromise
    ]).then(() => promise);
}

export async function removeLink(linkId: number) {
    let res = await internalRequest<null>(
        `users/links/${linkId}`,
        "DELETE"
    );
    linksList = linksList.filter(link => link.id !== linkId);
    return res;
}

async function internalRequest<T>(path: string, method: string = "GET") : Promise<ResponseData<T>> {
    let rawResponse = await fetch(`/api/${path}`, {
        headers: { "Authorization": `Bearer ${currentJWT}` },
        method: method,
    });
    let response: ResponseData<T> = {};
    if (!rawResponse.ok) {
        response.error = await rawResponse.json();
    }
    if (rawResponse.status === 204) {
        response.response = null;
    } else if (rawResponse.status === 429) {
        const delay = response.error!.seconds! * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return internalRequest(path, method);
    } else if (rawResponse.ok) {
        response.response = await rawResponse.json() as T;
    }
    return response;
}
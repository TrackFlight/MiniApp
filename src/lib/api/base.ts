import {telegram} from "../telegram";
import type {App, ResponseData} from "./types";
import {sessionStore} from "./auth";

const appListChangeCallbacks: (() => void)[] = [];

export async function withUIProgress<T>(promise: Promise<T>): Promise<T> {
    let res = await withTimeout(
        promise,
        () => telegram.showLoadingProgress(true),
    );
    telegram.showLoadingProgress(false);
    return res;
}

export async function withTimeout<T>(
    promise: Promise<T>,
    onTimeout: () => void
): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout>;

    const timeoutPromise = new Promise<ResponseData<T>>(
        (_) => timeoutId = setTimeout(onTimeout, 200)
    );

    return Promise.race([
        promise.finally(() => clearTimeout(timeoutId)),
        timeoutPromise,
    ]).then(() => promise);
}

export async function internalRequest<T, C>(path: string, method: string = "GET", body?: C) : Promise<ResponseData<T>> {
    let rawResponse = await fetch(`/api/${path}`, {
        headers: { "Authorization": `Bearer ${sessionStore.currentJWT}` },
        method: method,
        body: body ? JSON.stringify(body) : undefined,
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
        return internalRequest(path, method, body);
    } else if (rawResponse.ok) {
        response.response = await rawResponse.json() as T;
    }
    return response;
}

export function notifyAppListChanged() {
    appListChangeCallbacks.forEach(callback => callback());
}

export function onAppListChanged(callback: () => void) {
    appListChangeCallbacks.push(callback);
}
import {LRUCache} from "../lib/lru-cache";

const stickersLRUCache = new LRUCache<string, ArrayBuffer>(10);
export const stickersInstance = {
    getSticker: (name: string | ArrayBuffer | Record<string, unknown>) => {
        return getSticker(name);
    },
    preloadSticker: (name: string) => {
        return preloadSticker(name);
    }
}

async function preloadSticker(name: string) {
    if (stickersLRUCache.has(name)) {
        return;
    }
    await downloadAndCacheSticker(name);
}

async function getSticker(name: string | ArrayBuffer | Record<string, unknown>): Promise<ArrayBuffer | Record<string, unknown>> {
    if (typeof name !== "string") {
        return name;
    }
    if (stickersLRUCache.has(name)) {
        return stickersLRUCache.get(name)!;
    }
    return await downloadAndCacheSticker(name);
}

async function downloadAndCacheSticker(name: string) {
    const url = new URL(`../assets/stickers/${name}.lottie`, import.meta.url).href;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Failed to download sticker");
    }
    const buffer = await response.arrayBuffer();
    stickersLRUCache.set(name, buffer);
    return buffer;
}
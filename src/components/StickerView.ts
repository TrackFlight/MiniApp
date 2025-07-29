import {LRUCache} from "../lib/lru-cache";

const stickersLRUCache = new LRUCache<string, ArrayBuffer>(10);
export const stickersInstance = {
    getSticker: (name: string) => {
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

async function getSticker(name: string): Promise<ArrayBuffer> {
    if (stickersLRUCache.has(name)) {
        return stickersLRUCache.get(name)!;
    }
    return await downloadAndCacheSticker(name);
}

async function downloadAndCacheSticker(name: string) {
    const response = await fetch(`src/assets/stickers/${name}.lottie`);
    if (!response.ok) {
        throw new Error("Failed to download sticker");
    }
    const buffer = await response.arrayBuffer();
    stickersLRUCache.set(name, buffer);
    return buffer;
}
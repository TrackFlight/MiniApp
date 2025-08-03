import {telegram} from "../lib/telegram";

const showBottomSheetCallbacks: Record<string, (data: any) => void> = {};

telegram.showBottomSheet = (id: string, data: any) => {
    const callback = showBottomSheetCallbacks[id];
    if (callback) {
        callback(data);
    } else {
        console.warn(`No callback registered for bottom sheet with id: ${id}`);
    }
}

export function registerBottomSheet(id: string, callback: (data: any) => void) {
    showBottomSheetCallbacks[id] = callback;
}

export function unregisterBottomSheet(id: string) {
    delete showBottomSheetCallbacks[id];
}
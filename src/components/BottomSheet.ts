import {telegram} from "../lib/telegram";

const showBottomSheetCallbacks: Record<string, ((data: any) => void)[]> = {};
const closeBottomSheetCallbacks: Record<string, (() => void)[]> = {};

telegram.showBottomSheet = (id: string, data: any) => {
    const callbacks = showBottomSheetCallbacks[id];
    if (callbacks.length > 0) {
        callbacks.forEach(callback => callback(data));
    } else {
        console.warn(`No callback registered for bottom sheet with id: ${id}`);
    }
}

telegram.closeBottomSheet = (id: string) => {
    const callbacks = closeBottomSheetCallbacks[id];
    if (callbacks.length > 0) {
        callbacks.forEach(callback => callback());
    } else {
        console.warn(`No callback registered for closing bottom sheet with id: ${id}`);
    }
};

export function registerBottomSheet(id: string, callbackShow: (data: any) => void, callbackClose: () => void) {
    if (!showBottomSheetCallbacks[id]) {
        showBottomSheetCallbacks[id] = [];
        closeBottomSheetCallbacks[id] = [];
    }
    showBottomSheetCallbacks[id].push(callbackShow);
    closeBottomSheetCallbacks[id].push(callbackClose);
}

export function unregisterBottomSheet(id: string) {
    delete showBottomSheetCallbacks[id];
    delete closeBottomSheetCallbacks[id];
}
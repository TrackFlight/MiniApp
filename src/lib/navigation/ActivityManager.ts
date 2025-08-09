import {getContext, setContext} from 'svelte';
import {writable, type Writable} from "svelte/store";
import {telegram} from "../telegram";
import {ScrollCache} from "../scroll-cache";

export interface ActivityEntry<Props extends Record<string, any> = Record<string, any>> {
    id: number;
    name: string;
    props: Props;
}

export type ComponentsMap = Record<string, any>;

const CTX = Symbol('ActivityManager');

export interface ComponentContext {
    onCapture: (fn: () => any) => void;
    onRestore: (fn: (state: any) => void) => void;
}

export interface CaptureStateAPI {
    captureRawStates: () => any[];
    restoreRawStates: (savedRawStates: any[]) => void;
    onRegisterCapture: (fn: () => void) => void;
}

export interface ActivityManagerContext<Props extends Record<string, any> = Record<string, any>> {
    current: Writable<ActivityEntry<Props> | null>;
    stack: ActivityEntry<Props>[];

    onCapture: (fn: () => any) => void;
    onRestore: (fn: (state: any) => void) => void;

    startActivity: (name: string, props?: Props) => void;
    finishActivity: () => void;
    getComponentContext: (el: Element, subName?: string) => ComponentContext;
    getCaptureStateAPI: () => CaptureStateAPI;
}

let nextId = 1;
export function initActivityManager<Props extends Record<string, any> = Record<string, any>>(
    initialName: string
): ActivityManagerContext<Props> {

    let stack: ActivityEntry<Props>[] = [
        { id: nextId++, name: initialName, props: {} as Props }
    ];
    const current = writable<ActivityEntry<Props> | null>(stack[0]);
    const onCaptureCallbacks = new Map<string, () => any[]>();
    const onRestoreCallbacks = new Map<string, (state: any) => void>();
    const onCaptureAPIRestoreCallbacks = new Map<string, (() => void)[]>();
    const savedStates = new Map<string, any[]>();

    telegram.BackButton.onClick(() => finishActivity());

    async function startActivity(intentName: string, props: Props = {} as Props) {
        const oldEntry = stack.find(({ name }) => intentName === name);
        if (oldEntry) {
            current.set(oldEntry);
            return;
        }
        captureActivity(stack[stack.length - 1].name);
        const entry = { id: nextId++, name: intentName, props: props };
        stack.push(entry);
        if (stack.length > 1) {
            telegram.BackButton.show();
        }
        current.set(entry);
    }

    async function finishActivity() {
        if (stack.length <= 1 || stack[stack.length - 1].id === 1) return;
        stack.pop();
        await telegram.closeBulletin();
        if (stack.length <= 1) {
            telegram.BackButton.hide();
        }
        const currentActivity = stack[stack.length - 1];
        current.set(stack[stack.length - 1]);
        nextId--;
        restoreActivity(currentActivity.name);
    }

    function captureRawStates(): any[] {
        const savedRawStates: any[] = [];
        onCaptureCallbacks.forEach((fn, name) => {
            if (stack[stack.length - 1].name !== name.split(':')[0]) return;
            savedRawStates.push(fn());
            onCaptureCallbacks.delete(name);
            onRestoreCallbacks.delete(name);
        });
        return savedRawStates;
    }

    function restoreRawStates(savedRawStates: any[]) {
        onRestoreCallbacks.forEach((fn, name) => {
            if (stack[stack.length - 1].name !== name.split(':')[0]) return;
            const state = savedRawStates.shift();
            if (state !== undefined) {
                fn(state);
            }
        });
    }

    function captureActivity(activityName: string) {
        onCaptureCallbacks.forEach((fn, name) => {
            if (activityName !== name.split(':')[0]) return;
            if (!savedStates.has(name)) {
                savedStates.set(name, []);
            }
            savedStates.get(name)?.push(fn());
            onCaptureCallbacks.delete(name);
            onRestoreCallbacks.delete(name);
        })
    }

    function restoreActivity(activityName: string) {
        onRestoreCallbacks.forEach((fn, name) => {
            if (activityName !== name.split(':')[0]) return;
            const state = savedStates.get(name)?.shift();
            if (state !== undefined) {
                fn(state);
            }
            if (savedStates.get(name)?.length === 0) {
                savedStates.delete(name);
            }
        })
    }

    function onCapture(fn: () => any) {
        internalOnCapture(stack[stack.length - 1].name, fn);
    }

    function onRestore(fn: (state: any) => void) {
        internalOnRestore(stack[stack.length - 1].name, fn);
    }

    function internalOnCapture(key: string, fn: () => any) {
        onCaptureCallbacks.set(key, fn);
    }

    function internalOnRestore(key: string, fn: (state: any) => void) {
        const activityName = key.split(':')[0];
        if (savedStates.has(key)) {
            const state = savedStates.get(key)?.shift();
            fn(state);
            if (savedStates.get(key)?.length === 0) {
                savedStates.delete(key);
            }
        }
        onRestoreCallbacks.set(key, fn);
        if (onCaptureAPIRestoreCallbacks.has(activityName)) {
            onCaptureAPIRestoreCallbacks.get(activityName)?.forEach((fn) => fn());
        }
    }

    function onRegisterCapture(fn: () => void) {
        const activityName = stack[stack.length - 1].name;
        if (!onCaptureAPIRestoreCallbacks.has(activityName)) {
            onCaptureAPIRestoreCallbacks.set(activityName, []);
        }
        onCaptureAPIRestoreCallbacks.get(activityName)?.push(fn);
    }

    function getComponentContext(el: Element, subName?: string): ComponentContext {
        let key = `${stack[stack.length - 1].name}:${ScrollCache.getDomPath(el)}${`:${subName}` || ''}`;
        return {
            onCapture: (fn: () => any) => internalOnCapture(key, fn),
            onRestore: (fn: (state: any) => void) => internalOnRestore(key, fn)
        }
    }

    function getCaptureStateAPI(): CaptureStateAPI {
        return {
            captureRawStates,
            restoreRawStates,
            onRegisterCapture
        };
    }

    setContext<ActivityManagerContext<Props>>(CTX, {
        stack,
        current,
        startActivity,
        finishActivity,
        onCapture,
        onRestore,
        getComponentContext,
        getCaptureStateAPI
    });

    return {
        stack,
        current,
        startActivity,
        finishActivity,
        onCapture,
        onRestore,
        getComponentContext,
        getCaptureStateAPI
    };
}

export function getApplicationContext<Props extends Record<string, any> = Record<string, any>>(): ActivityManagerContext<Props> {
    return getContext<ActivityManagerContext<Props>>(CTX);
}

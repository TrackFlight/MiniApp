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
    onCapture: (fn: () => any) => void;
    onRestore: (fn: (state: any) => void) => void;

    captureRawStates: () => Record<string, any>;
    restoreRawStates: (savedRawStates: Record<string, any>) => void;
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
    getFragmentContext: (fragmentName: string) => ComponentContext;
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
    const onCaptureCallbacks = new Map<string, {callback: () => any[], onlyAPI: boolean}>();
    const onRestoreCallbacks = new Map<string, {callback: (state: any) => void, onlyAPI: boolean}>();
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
        await telegram.closeBulletin();
        stack.pop();
        if (stack.length <= 1) {
            telegram.BackButton.hide();
        }
        const currentActivity = stack[stack.length - 1];
        current.set(stack[stack.length - 1]);
        nextId--;
        restoreActivity(currentActivity.name);
    }

    function captureRawStates(): Record<string, any> {
        const savedRawStates: Record<string, any> = {};
        onCaptureCallbacks.forEach((fn, name) => {
            if (stack[stack.length - 1].name !== name.split(':')[0]) return;
            savedRawStates[name] = fn.callback();
            onCaptureCallbacks.delete(name);
            onRestoreCallbacks.delete(name);
        });
        return savedRawStates;
    }

    function restoreRawStates(savedRawStates: Record<string, any>) {
        onRestoreCallbacks.forEach((fn, name) => {
            if (stack[stack.length - 1].name !== name.split(':')[0]) return;
            fn.callback(savedRawStates[name]);
        });
    }

    function captureActivity(activityName: string) {
        onCaptureCallbacks.forEach((fn, name) => {
            if (activityName !== name.split(':')[0] || fn.onlyAPI) return;
            if (!savedStates.has(name)) {
                savedStates.set(name, []);
            }
            savedStates.get(name)?.push(fn.callback());
            onCaptureCallbacks.delete(name);
            onRestoreCallbacks.delete(name);
        })
        onCaptureAPIRestoreCallbacks.delete(activityName);
    }

    function restoreActivity(activityName: string) {
        onRestoreCallbacks.forEach((fn, name) => {
            if (activityName !== name.split(':')[0] || fn.onlyAPI) return;
            const state = savedStates.get(name)?.shift();
            if (state !== undefined) {
                fn.callback(state);
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

    function internalOnCapture(key: string, fn: () => any, onlyAPI: boolean = false) {
        onCaptureCallbacks.set(key, {callback: fn, onlyAPI: onlyAPI});
    }

    function internalOnRestore(key: string, fn: (state: any) => void, onlyAPI: boolean = false) {
        const activityName = key.split(':')[0];
        if (savedStates.has(key)) {
            const state = savedStates.get(key)?.shift();
            fn(state);
            if (savedStates.get(key)?.length === 0) {
                savedStates.delete(key);
            }
        }
        onRestoreCallbacks.set(key, {callback: fn, onlyAPI: onlyAPI});
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

    function getFragmentContext(fragmentName: string): ComponentContext {
        let key = `${stack[stack.length - 1].name}:fragment:${fragmentName}`;
        return {
            onCapture: (fn: () => any) => internalOnCapture(key, fn),
            onRestore: (fn: (state: any) => void) => internalOnRestore(key, fn)
        }
    }

    function getComponentContext(el: Element, subName?: string): ComponentContext {
        let key = `${stack[stack.length - 1].name}:${ScrollCache.getDomPath(el)}${`:${subName}` || ''}`;
        return {
            onCapture: (fn: () => any) => internalOnCapture(key, fn),
            onRestore: (fn: (state: any) => void) => internalOnRestore(key, fn)
        }
    }

    function getCaptureStateAPI(): CaptureStateAPI {
        const activityName = stack[stack.length - 1].name;
        return {
            onCapture: (fn: () => any) => internalOnCapture(activityName, fn, true),
            onRestore: (fn: (state: any) => void) => internalOnRestore(activityName, fn, true),

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
        getFragmentContext,
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
        getFragmentContext,
        getCaptureStateAPI
    };
}

export function getApplicationContext<Props extends Record<string, any> = Record<string, any>>(): ActivityManagerContext<Props> {
    return getContext<ActivityManagerContext<Props>>(CTX);
}

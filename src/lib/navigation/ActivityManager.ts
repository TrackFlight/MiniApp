import {getContext, setContext} from 'svelte';
import {writable, type Writable} from "svelte/store";
import {telegram} from "../telegram";

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

export interface ActivityManagerContext<Props extends Record<string, any> = Record<string, any>> {
    current: Writable<ActivityEntry<Props> | null>;
    stack: ActivityEntry<Props>[];

    onCapture: (fn: () => any) => void;
    onRestore: (fn: (state: any) => void) => void;

    startActivity: (name: string, props?: Props) => void;
    finishActivity: () => void;
    getDomPath: (el: Element) => string
    getComponentContext: (el: Element) => ComponentContext;
}

let nextId = 1;
export function initActivityManager<Props extends Record<string, any> = Record<string, any>>(
    initialName: string
): ActivityManagerContext<Props> {

    let stack: ActivityEntry<Props>[] = [
        { id: nextId++, name: initialName, props: {} as Props }
    ];
    const current = writable<ActivityEntry<Props> | null>(stack[0]);
    const onCaptureCallbacks = new Map<string, () => any>();
    const onRestoreCallbacks = new Map<string, (state: any) => void>();
    const savedStates = new Map<string, any>();

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
        if (stack.length <= 1) {
            telegram.BackButton.hide();
        }
        const currentActivity = stack[stack.length - 1];
        current.set(stack[stack.length - 1]);
        nextId--;
        restoreActivity(currentActivity.name);
        savedStates.delete(currentActivity.name);
    }

    function captureActivity(activityName: string) {
        onCaptureCallbacks.forEach((fn, name) => {
            if (activityName !== name.split(':')[0]) return;
            savedStates.set(name, fn());
            onCaptureCallbacks.delete(name);
            onRestoreCallbacks.delete(name);
        })
    }

    function restoreActivity(activityName: string) {
        onRestoreCallbacks.forEach((fn, name) => {
            if (activityName !== name.split(':')[0]) return;
            const state = savedStates.get(name);
            if (state !== undefined) {
                fn(state);
            }
        })
    }

    function onCapture(fn: () => any) {
        onCaptureCallbacks.set(stack[stack.length - 1].name, fn);
    }

    function onRestore(fn: (state: any) => void) {
        let key = stack[stack.length - 1].name;
        if (savedStates.has(key)) {
            fn(savedStates.get(key));
            savedStates.delete(key);
        }
        onRestoreCallbacks.set(key, fn);
    }

    function getDomPath(el: Element): string {
        const path = [];
        let current: Element | null = el;
        while (current && current.parentElement) {
            path.unshift(`${current.tagName.toLowerCase()}`);
            current = current.parentElement;
        }
        return path.join(' > ');
    }

    function getComponentContext(el: Element): ComponentContext {
        let key =  `${stack[stack.length - 1].name}:${getDomPath(el)}`;
        return {
            onCapture: (fn: () => any) => {
                onCaptureCallbacks.set(key, fn);
            },
            onRestore: (fn: (state: any) => void) => {
                if (savedStates.has(key)) {
                    fn(savedStates.get(key));
                    savedStates.delete(key);
                }
                onRestoreCallbacks.set(key, fn);
            }
        }
    }

    setContext<ActivityManagerContext<Props>>(CTX, {
        stack,
        current,
        startActivity,
        finishActivity,
        onCapture,
        onRestore,
        getDomPath,
        getComponentContext
    });

    return {
        current,
        stack,
        startActivity,
        finishActivity,
        onCapture,
        onRestore,
        getDomPath,
        getComponentContext
    };
}

export function getApplicationContext<Props extends Record<string, any> = Record<string, any>>(): ActivityManagerContext<Props> {
    return getContext<ActivityManagerContext<Props>>(CTX);
}

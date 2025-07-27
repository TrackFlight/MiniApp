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

export interface ActivityManagerContext<Props extends Record<string, any> = Record<string, any>> {
    current: Writable<ActivityEntry<Props> | null>;
    stack: ActivityEntry<Props>[];
    startActivity: (name: string, props?: Props) => void;
    finishActivity: () => void;
}

let nextId = 1;
export function initActivityManager<Props extends Record<string, any> = Record<string, any>>(
    initialName: string
): ActivityManagerContext<Props> {

    let stack: ActivityEntry<Props>[] = [
        { id: nextId++, name: initialName, props: {} as Props }
    ];
    const current = writable<ActivityEntry<Props> | null>(stack[0]);
    telegram.BackButton.onClick(() => finishActivity())

    async function startActivity(intentName: string, props: Props = {} as Props) {
        const oldEntry = stack.find(({ name }) => intentName === name);
        if (oldEntry) {
            current.set(oldEntry);
            return;
        }
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
        current.set(stack[stack.length - 1]);
        nextId--;
    }

    setContext<ActivityManagerContext<Props>>(CTX, { stack, current, startActivity, finishActivity });

    return { current, stack, startActivity, finishActivity };
}

export function useActivityManager<Props extends Record<string, any> = Record<string, any>>(): ActivityManagerContext<Props> {
    return getContext<ActivityManagerContext<Props>>(CTX);
}

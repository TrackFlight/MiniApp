import {writable} from "svelte/store";
import type {BulletinButton} from "./telegram";

export const bulletinState = writable<{
    title?: string,
    text: string,
    icon: string,
    duration?: number
    button?: BulletinButton,
    on_close?: () => void,
    shake?: boolean
    reopen?: boolean
} | null>(null);

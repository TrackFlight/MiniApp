<script lang="ts">
    import { onMount } from 'svelte';
    import { Tween } from "svelte/motion";
    import { linear } from "svelte/easing";
    import { isiOS, telegram, type BulletinButton } from "../lib/telegram";
    import { fly } from 'svelte/transition';
    import { bulletinState } from "../lib/stores";
    import Button from "./Button.svelte";
    import StickerView from "./StickerView.svelte";

    const {
        on_close,
    } : {
        on_close?: () => void,
    } = $props();

    let title: string | undefined = $state();
    let text: string = $state("");
    let icon: string | undefined = $state();
    let duration: number = $state(0);

    let ready = $state(false);
    let closeTimeout: ReturnType<typeof setTimeout>;
    let shakeTimeout: ReturnType<typeof setTimeout>;
    let showBulletin: boolean = $state(false);
    let shakeBulletin: boolean = $state(false);
    let player: StickerView | undefined = $state();
    let actionButton: BulletinButton | undefined = $state();
    let onCloseEvent: (() => void) | undefined = $state();
    let closedByUndo: boolean = $state(false);

    bulletinState.subscribe((state) => {
        title = state!.title;
        text = state!.text;
        icon = state!.icon;
        duration = state!.duration || 1800;
        actionButton = state!.button;
        onCloseEvent = state!.on_close;

        if (state!.reopen) {
            clearTimeout(closeTimeout);
            close(true, false);
            closeTimeout = setTimeout(() => {
                progress = getProgressAnim();
                showBulletin = true;
                progress.set(1);
                clearTimeout(closeTimeout);
                close();
            }, 150);
        }

        if (state!.shake) {
            if (!player) {
                return;
            }
            showBulletin = true;
            shakeBulletin = state!.shake || false;
            clearTimeout(closeTimeout);
            clearTimeout(shakeTimeout);
            telegram.HapticFeedback.notificationOccurred("error");
            shakeTimeout = setTimeout(() => {
                shakeBulletin = false;
                close();
            }, 400);
        }
    })

    function getProgressAnim() {
        return new Tween(0, {
            duration: duration,
            easing: linear
        });
    }

    let progress = $derived(getProgressAnim());
    let currentTextTimerStatus = $derived(duration / 1000 - Math.floor(duration * progress.current / 1000));

    onMount(async () => setTimeout(() => {
        ready = true;
        showBulletin = true;
        progress.set(1);
        close();
    }, 60));

    function on_sticker_load() {
        if (player) {
            showBulletin = true;
            player.play();
            close();
        }
    }

    function close(skipOpen: boolean = false, allowDeletion: boolean = true) {
        closeTimeout = setTimeout(() => {
            showBulletin = false;
            if (onCloseEvent && !closedByUndo) onCloseEvent();
            if (!allowDeletion) return;
            closeTimeout = setTimeout(() => {
                if (on_close) on_close();
            }, 150);
        }, skipOpen ? 0 : ((duration || 1800) + 150));
    }

    function undoClick() {
        closedByUndo = true;
        actionButton!.on_click();
        clearTimeout(closeTimeout);
        close(true);
    }
</script>

<div class="bulletin" class:isiOS class:showBulletin class:ready role="alert" aria-live="polite">
    <div class:shakeBulletin>
        {#if icon === "timer"}
            <div class="timerContainer">
                <svg viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="44"
                        fill="none"
                        stroke="var(--tg-theme-text-color)"
                        stroke-width="12"
                        stroke-dasharray="282.6, 282.6"
                        stroke-dashoffset="{-282.6 * progress.current}"
                        stroke-linecap="round"
                    />
                </svg>
                <div>
                    {#key currentTextTimerStatus}
                        <p in:fly="{{ y: -8, duration: 300 }}" out:fly="{{ y: 8, duration: 300 }}">
                            {currentTextTimerStatus}
                        </p>
                    {/key}
                </div>
            </div>
        {:else if icon}
            <StickerView bind:this={player} size="40px" sticker={icon} on_load={on_sticker_load}/>
        {/if}
        <div class="container">
            <p>{title}</p>
            <p>{text}</p>
        </div>
        {#if actionButton}
            <Button type="default accent rounded text" on_click={undoClick}>
                <div class="buttonContent" class:isiOS>
                    {#if !isiOS && actionButton.isUndo}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                            <path d="M320-200q-17 0-28.5-11.5T280-240q0-17 11.5-28.5T320-280h244q63 0 109.5-40T720-420q0-60-46.5-100T564-560H312l76 76q11 11 11 28t-11 28q-11 11-28 11t-28-11L188-572q-6-6-8.5-13t-2.5-15q0-8 2.5-15t8.5-13l144-144q11-11 28-11t28 11q11 11 11 28t-11 28l-76 76h252q97 0 166.5 63T800-420q0 94-69.5 157T564-200H320Z"/>
                        </svg>
                    {/if}
                    <p>{isiOS ? actionButton.text.toUpperCase() : actionButton.text}</p>
                </div>
            </Button>
        {/if}
    </div>
</div>

<style>
    .bulletin {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        bottom: 0;
        padding-block-end: 15px;
        padding-inline: 10px;
        transform: translateY(100%);
    }

    .bulletin.ready {
        transition: transform 150ms ease-in-out;
    }

    .bulletin > div {
        display: flex;
        align-items: center;
        width: 100%;
        padding-block: 6px;
        padding-inline: 12px;
        border-radius: 10px;
        background: color-mix(in srgb, color-mix(in srgb, var(--tg-theme-section-bg-color) 92%, var(--tg-theme-hint-color)) 85%, transparent);
    }

    .bulletin.isiOS > div {
        backdrop-filter: var(--global-backdrop-filter);
        -webkit-backdrop-filter: saturate(180%) blur(20px);
    }

    .bulletin.showBulletin {
        transform: translateY(0%);
    }

    .bulletin > div.shakeBulletin {
        animation: shake 0.4s ease-in-out infinite;
    }

    .container {
        margin-left: 6px;
    }

    .container > p {
        color: var(--tg-theme-text-color);
        margin: 0;
    }

    .container > p:first-child {
        font-weight: 500;
        font-size: 15px;
    }

    .container > p:last-child {
        font-size: 14px;
    }

    @keyframes shake {
        0% { transform: translate(1px, 1px) rotate(0deg); }
        10% { transform: translate(-1px, -2px) rotate(-1deg); }
        20% { transform: translate(-3px, 0px) rotate(1deg); }
        30% { transform: translate(3px, 2px) rotate(0deg); }
        40% { transform: translate(1px, -1px) rotate(1deg); }
        50% { transform: translate(-1px, 2px) rotate(-1deg); }
        60% { transform: translate(-3px, 1px) rotate(0deg); }
        70% { transform: translate(3px, 1px) rotate(-1deg); }
        80% { transform: translate(-1px, -1px) rotate(1deg); }
        90% { transform: translate(1px, 2px) rotate(0deg); }
        100% { transform: translate(1px, -2px) rotate(-1deg); }
    }

    .timerContainer {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        padding: 5px;
    }

    .timerContainer > div {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        width: 2ch;
        justify-content: center;
        align-items: center;
    }

    .timerContainer > div > p {
        font-size: 12px;
        color: var(--tg-theme-text-color);
        margin: 0;
        font-weight: 500;
        position: absolute;
    }

    .timerContainer > svg {
        transform: rotate(-90deg);
        width: 22px;
    }

    .bulletin > div > :global(div:last-child:has(.buttonContent)) {
        margin-left: auto;
    }

    .buttonContent {
        padding-inline: 10px;
        padding-block: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
    }

    .buttonContent > :global(svg) {
        width: 24px;
        fill: var(--tg-theme-accent-text-color);
        transform: rotate(0deg) translateY(-1px);
    }

    .buttonContent:not(:has(:global(svg))) > p {
        padding-block: 5px;
        padding-inline: 5px;
    }

    .buttonContent > p {
        margin: 0;
        font-weight: 600;
        color: var(--tg-theme-accent-text-color);
        font-size: 14px;
    }

    .buttonContent.isiOS > p {
        font-weight: 500;
        font-size: 16px;
    }
</style>
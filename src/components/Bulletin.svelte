<script lang="ts">
    import {type BulletinButton, isiOS, telegram} from "../lib/telegram";
    import {fly} from 'svelte/transition';
    import {cubicInOut, linear} from "svelte/easing";
    import {Tween} from "svelte/motion";
    import StickerView from "./StickerView.svelte";
    import Button from "./Button.svelte";
    import {onDestroy} from "svelte";
    import {stickersInstance} from "./StickerView";

    const defaultDuration = 1800;

    let showBulletin = $state(false);
    let shakeBulletin = $state(false);
    let player = $state<StickerView>();
    let progress = $state<Tween<number>>();
    let closeTimeout: ReturnType<typeof setTimeout>;
    let shakeTimeout: ReturnType<typeof setTimeout>;

    let {
        bottom_margin = '0px',
    }  : {
        bottom_margin?: string;
    } = $props();

    let current: {
        title?: string,
        message: string,
        icon?: string,
        button?: BulletinButton,
        duration: number,
        on_close?: () => void,
    } | undefined = $state();
    let currentTextTimerStatus = $derived((current?.duration || defaultDuration) / 1000 - Math.floor((current?.duration || defaultDuration) * (progress?.current || 0) / 1000));

    telegram.showBulletin = async (icon: string, message: string, duration?: number, title?: string, button?: BulletinButton, on_close?: () => void) => {
        const isSame = current && current.icon === icon && current.message === message && current.title === title && current?.icon !== 'timer';
        const isVisible = document.getElementsByClassName('bulletin').length > 0;
        const newData = {
            title: title,
            message: message,
            duration: duration || defaultDuration,
            button: button,
            icon: icon,
            on_close: on_close,
        };
        if (isVisible && !isSame) {
            clearTimeout(closeTimeout);
            close(true);
            closeTimeout = setTimeout(async () => {
                current = newData;
                await preloadSticker(icon);
                progress = getProgressAnim();
                showBulletin = true;
                progress.set(1).then();
                clearTimeout(closeTimeout);
                close();
            }, 250);
            return;
        }

        clearTimeout(closeTimeout);
        if (isVisible && isSame) {
            shakeBulletin = true;
            clearTimeout(shakeTimeout);
            telegram.HapticFeedback.notificationOccurred("error");
            shakeTimeout = setTimeout(() => {
                shakeBulletin = false;
                close();
            }, 400);
        } else {
            current = newData;
            await preloadSticker(icon);
            if (!showBulletin) {
                progress = getProgressAnim();
                progress.set(1).then();
            }
            close();
        }
        showBulletin = true;
    }

    telegram.closeBulletin = async () => {
        return new Promise<void>((resolve) => {
            if (!showBulletin) {
                resolve();
                return;
            }
            clearTimeout(closeTimeout);
            close(true, resolve);
        });
    }

    onDestroy(() => {
        clearTimeout(closeTimeout);
        clearTimeout(shakeTimeout);
    });

    function on_sticker_load() {
        player?.play();
    }

    function undoClick() {
        current!.button!.on_click();
        clearTimeout(closeTimeout);
        showBulletin = false;
    }

    function close(skipOpen: boolean = false, close_event?: () => void) {
        closeTimeout = setTimeout(() => {
            showBulletin = false;
            if (current?.on_close) current.on_close();
            if (close_event) close_event();
        }, skipOpen ? 0 : (current!.duration + 250));
    }

    function getProgressAnim() {
        return new Tween(0, {
            duration: current!.duration,
            easing: linear
        });
    }

    async function preloadSticker(new_icon: string) {
        if (!current || !new_icon) return;
        if (new_icon == 'timer') {
            current.icon = 'timer';
            return;
        }
        await stickersInstance.preloadSticker(new_icon);
    }
</script>

{#if showBulletin && current}
    <div class="bulletin"
         class:isiOS
         class:shakeBulletin
         transition:fly={{ y: "100%", duration: 250, easing: cubicInOut }}
         style="--bottom-margin: {bottom_margin}"
         role="alert" aria-live="polite"
    >
        {#if current.icon === "timer" && progress}
            <div class="timerContainer">
                <svg viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="44"
                        fill="none"
                        stroke="white"
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
        {:else if current.icon}
            <StickerView bind:this={player} size="40px" sticker={current.icon} on_load={on_sticker_load}/>
        {/if}
        <div class="container">
            <p>{current.title}</p>
            <p>{current.message}</p>
        </div>
        {#if current.button}
            <Button text={current.button.text} on_click={undoClick} secondary undo={current.button.isUndo}/>
        {/if}
    </div>
{/if}

<style>
    .bulletin {
        position: absolute;
        display: flex;
        align-items: center;
        width: calc(100% - 20px);
        margin-inline: 10px;
        border-radius: 12px;
        padding-block: 6px;
        padding-inline: 12px;
        bottom: calc(20px + var(--bottom-margin));
        background: color-mix(in srgb,
            color-mix(
                in srgb,
                color-mix(
                    in srgb,
                    oklch(from var(--tg-theme-section-bg-color) 25% c h) 90%,
                    var(--tg-theme-section-bg-color)
                ) 98%,
                var(--tg-theme-hint-color)
            ) 95%,
            transparent
        );
        z-index: 99;
    }

    .bulletin.isiOS {
        backdrop-filter: var(--global-backdrop-filter);
        -webkit-backdrop-filter: saturate(180%) blur(20px);
    }

    .bulletin.shakeBulletin {
        animation: shake 0.4s ease-in-out infinite;
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

    .container {
        margin-left: 6px;
    }

    .container > p {
        color: white;
        margin: 0;
    }

    .container > p:first-child {
        font-weight: 500;
        font-size: 15px;
    }

    .container > p:last-child {
        font-size: 14px;
    }

    /*noinspection CssUnusedSymbol*/
    .bulletin > :global(.button:last-child) {
        margin-left: auto;
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
        color: white;
        margin: 0;
        font-weight: 500;
        position: absolute;
    }

    .timerContainer > svg {
        transform: rotate(-90deg);
        width: 22px;
    }
</style>
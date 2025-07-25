<script lang="ts">
    import {type BulletinButton, isiOS, telegram} from "../lib/telegram";
    import {fly} from 'svelte/transition';
    import {cubicOut, linear} from "svelte/easing";
    import {Tween} from "svelte/motion";
    import StickerView from "./StickerView.svelte";
    import Button from "./Button.svelte";
    import {LRUCache} from "../lib/lru-cache";

    const defaultDuration = 1800;

    let showBulletin = $state(false);
    let shakeBulletin = $state(false);
    let player = $state<StickerView>();
    let progress = $state<Tween<number>>();
    let closeTimeout: ReturnType<typeof setTimeout>;
    let shakeTimeout: ReturnType<typeof setTimeout>;
    const lruCache = new LRUCache<string, ArrayBuffer>(10);

    let current: {
        title?: string,
        message: string,
        icon?: string,
        iconData?: ArrayBuffer,
        button?: BulletinButton,
        duration: number,
        on_close?: () => void,
    } | undefined = $state();
    let currentTextTimerStatus = $derived((current?.duration || defaultDuration) / 1000 - Math.floor((current?.duration || defaultDuration) * (progress?.current || 0) / 1000));

    telegram.showBulletin = async (icon: string, message: string, duration?: number, title?: string, button?: BulletinButton, on_close?: () => void) => {
        let isSame = current && current.icon === icon && current.message === message && current.title === title && current?.icon !== 'timer';
        let newData = {
            title: title,
            message: message,
            duration: duration || defaultDuration,
            button: button,
            on_close: on_close,
        };
        if (showBulletin && !isSame) {
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
        if (showBulletin && isSame) {
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
        if (lruCache.has(new_icon)) {
            current.icon = new_icon;
            current.iconData = lruCache.get(new_icon);
            return;
        }
        if (current.icon === new_icon && current.iconData) {
            return;
        }
        const url = `src/assets/stickers/${new_icon}.lottie`;
        let response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to load sticker");
        }
        current.icon = new_icon;
        current.iconData = await response.arrayBuffer();
        lruCache.set(new_icon, current.iconData);
    }
</script>

{#if showBulletin && current}
    <div class="bulletin"
         class:isiOS
         class:shakeBulletin
         transition:fly={{ y: "100%", duration: 250, easing: cubicOut }}
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
        {:else if current.icon}
            <StickerView bind:this={player} size="40px" sticker={current.iconData} on_load={on_sticker_load}/>
        {/if}
        <div class="container">
            <p>{current.title}</p>
            <p>{current.message}</p>
        </div>
        {#if current.button}
            <Button type="default accent rounded text" on_click={undoClick}>
                {#if !isiOS && current.button.isUndo}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                        <path d="M320-200q-17 0-28.5-11.5T280-240q0-17 11.5-28.5T320-280h244q63 0 109.5-40T720-420q0-60-46.5-100T564-560H312l76 76q11 11 11 28t-11 28q-11 11-28 11t-28-11L188-572q-6-6-8.5-13t-2.5-15q0-8 2.5-15t8.5-13l144-144q11-11 28-11t28 11q11 11 11 28t-11 28l-76 76h252q97 0 166.5 63T800-420q0 94-69.5 157T564-200H320Z"/>
                    </svg>
                {/if}
                <p>{isiOS ? current.button.text.toUpperCase() : current.button.text}</p>
            </Button>
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
        border-radius: 10px;
        padding-block: 6px;
        padding-inline: 12px;
        bottom: 15px;
        background: color-mix(in srgb, color-mix(in srgb, var(--tg-theme-section-bg-color) 92%, var(--tg-theme-hint-color)) 85%, transparent);
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

    /*noinspection CssUnusedSymbol*/
    .bulletin > :global(.button:last-child) {
        margin-left: auto;
        padding-inline: 10px;
        padding-block: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
    }

    .bulletin > :global(.button:last-child > div > svg) {
        width: 24px;
        margin-right: 5px;
        fill: var(--tg-theme-accent-text-color);
        transform: rotate(0deg) translateY(-1px);
    }

    .bulletin > :global(.button:last-child > div:not(:has(svg)) > p) {
        padding-block: 5px;
        padding-inline: 5px;
    }

    .bulletin > :global(.button:last-child > div > p) {
        margin: 0;
        font-weight: 600;
        color: var(--tg-theme-accent-text-color);
        font-size: 14px;
    }

    .bulletin.isiOS > :global(.button:last-child > div > p) {
        font-weight: 500;
        font-size: 16px;
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
</style>
<script lang="ts">
    import {onDestroy, onMount} from "svelte";
    import {fade} from 'svelte/transition';
    import {isDesktop} from "../lib/telegram";

    let {
        rippleColor = 'rgba(0, 0, 0, 0.08)',
    } : {
        rippleColor?: string,
    } = $props();

    interface Ripple {
        id: number;
        x: number;
        y: number;
        keepHold: boolean;
        size: number;
        added: number;
    }

    let rippleId = $state(0);
    let ripples: Ripple[] = $state([]);
    let removeRipplesTimeout: ReturnType<typeof setTimeout>;
    let cancelHoldingTimeout: ReturnType<typeof setTimeout>;
    let rippleHandler: HTMLDivElement;
    let rippleHandlerListener: HTMLElement;

    function onRippleStart(e: MouseEvent | TouchEvent) {
        if (!isDesktop && e instanceof MouseEvent) {
            return;
        }

        const target = e.target as HTMLElement;
        if (target.closest('.clickable') !== rippleHandlerListener) {
            return;
        }
        const clientX = e instanceof MouseEvent ? e.clientX : (e as TouchEvent).changedTouches[0].clientX;
        const clientY = e instanceof MouseEvent ? e.clientY : (e as TouchEvent).changedTouches[0].clientY;
        const rect = rippleHandler.getBoundingClientRect();
        const distanceToCorner = Math.sqrt(
            Math.pow(Math.max(clientX - rect.left, rect.right - clientX), 2) +
            Math.pow(
                Math.max(clientY - rect.top, rect.bottom - clientY),
                2,
            ),
        );
        const size = distanceToCorner * 2;
        clearTimeout(cancelHoldingTimeout);
        clearTimeout(removeRipplesTimeout);

        ripples = [
            ...ripples,
            {
                id: rippleId++,
                x: clientX - rect.left - size / 2,
                y: clientY - rect.top - size / 2,
                keepHold: !ripples.find((r) => r.keepHold)?.keepHold || false,
                added: Date.now(),
                size,
            },
        ];
        removeRipplesTimeout = setTimeout(() => {
            ripples = ripples.filter((r) =>
                r.added + 800 > Date.now() || r.keepHold
            );
        }, 900);
    }

    function onRippleEnd() {
        clearTimeout(cancelHoldingTimeout);
        cancelHoldingTimeout = setTimeout(() => {
            ripples = ripples.filter((r) => !r.keepHold);
        }, 150);
    }

    onMount(() => {
        rippleHandlerListener = rippleHandler.closest('.clickable') as HTMLElement;
        rippleHandlerListener.addEventListener('mousedown', onRippleStart);
        rippleHandlerListener.addEventListener('touchstart', onRippleStart);
        rippleHandlerListener.addEventListener('mouseup', onRippleEnd);
        rippleHandlerListener.addEventListener('touchend', onRippleEnd);
        rippleHandlerListener.addEventListener('mouseleave', onRippleEnd);
        rippleHandlerListener.addEventListener('touchcancel', onRippleEnd);
    });

    onDestroy(() => {
        rippleHandlerListener.removeEventListener('mousedown', onRippleStart);
        rippleHandlerListener.removeEventListener('touchstart', onRippleStart);
        rippleHandlerListener.removeEventListener('mouseup', onRippleEnd);
        rippleHandlerListener.removeEventListener('touchend', onRippleEnd);
        rippleHandlerListener.removeEventListener('mouseleave', onRippleEnd);
        rippleHandlerListener.removeEventListener('touchcancel', onRippleEnd);
    });
</script>

<div style="--ripple-color: {rippleColor}" class="ripple-container" bind:this={rippleHandler}>
    {#each ripples as ripple (ripple.id)}
        {@const hold = ripple.keepHold}
        <div
            class="ripple-wave"
            class:hold
            out:fade={{ duration: 200 }}
            style="left: {ripple.x}px; top: {ripple.y}px; width: {ripple.size}px; height: {ripple.size}px;"
        ></div>
    {/each}
</div>

<style>
    .ripple-container {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        overflow: hidden;
        border-radius: inherit;
        pointer-events: none;
    }

    .ripple-wave {
        pointer-events: none;
        position: absolute;
        transform: scale(0);
        display: block;
        border-radius: 50%;
        background-color: var(--ripple-color);
        animation: ripple-animation 800ms;

    }

    .ripple-wave.hold {
        transform: scale(2);
        animation: ripple-animation-hold 800ms;
    }

    @keyframes ripple-animation-hold {
        from {
            transform: scale(0);
        }
        to {
            transform: scale(2);
        }
    }

    @keyframes ripple-animation {
        from {
            transform: scale(0);
            opacity: 1;
        }
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
</style>
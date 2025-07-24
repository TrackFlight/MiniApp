<script lang="ts">
    import {onDestroy, onMount} from "svelte";
    import {fade} from 'svelte/transition';
    import {DotLottie} from "@lottiefiles/dotlottie-web";

    const {
        size,
        sticker,
        loop = false,
        autoplay = false,
        on_load,
        children
    } : {
        size: string
        sticker: string,
        loop?: boolean,
        autoplay?: boolean,
        on_load?: () => void,
        children?: any
    } = $props();

    let dotLottie: DotLottie;
    let loaded = $state(false);
    let wrapper: HTMLDivElement;
    let lottieEl: HTMLCanvasElement;
    let observer: IntersectionObserver;

    onMount(() => {
        dotLottie = new DotLottie({
            canvas:  lottieEl,
            src: `src/assets/stickers/${sticker}.lottie`,
            loop: loop,
            autoplay: autoplay
        });

        dotLottie.addEventListener("load", () => {
            loaded = true;
            if (on_load) on_load();
        });

        observer = new IntersectionObserver(([entry]) => {
            if (!dotLottie) return;
            if (entry.isIntersecting) {
                dotLottie.unfreeze();
            } else {
                dotLottie.freeze();
            }
        }, {
            root: null,
            threshold: 0.1
        });

        observer.observe(wrapper);
    });

    onDestroy(() => {
        if (observer) observer.disconnect();
    });

    export function play() {
        dotLottie.play();
    }
</script>

<div bind:this={wrapper} class="sticker-view" style="width: {size}; height: {size};" class:loaded>
    {#if !loaded}
    <div out:fade="{{ duration: 300 }}">
        {@render children?.()}
    </div>
    {/if}
    <canvas bind:this={lottieEl}></canvas>
</div>

<style>
    .sticker-view {
        position: relative;
        overflow: hidden;
    }

    .sticker-view > canvas, .sticker-view > div > :global(svg) {
        width: 100%;
        height: 100%;
        display: block;
        transition: opacity 250ms ease-in-out;
    }

    .sticker-view.loaded > canvas {
        opacity: 1;
    }

    .sticker-view > canvas {
        opacity: 0;
    }

    .sticker-view > div {
        position: absolute;
    }
</style>
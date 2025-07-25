<script lang="ts">
    import {onMount} from "svelte";
    import {fade} from 'svelte/transition';
    import {DotLottie} from "@lottiefiles/dotlottie-web";

    const {
        size,
        sticker = $bindable(),
        loop = false,
        autoplay = false,
        on_load,
        children
    } : {
        size: string
        sticker?: string | ArrayBuffer,
        loop?: boolean,
        autoplay?: boolean,
        on_load?: () => void,
        children?: any
    } = $props();

    let dotLottie: DotLottie;
    let loaded = $state(false);
    let lottieEl: HTMLCanvasElement;

    onMount(async () => {
        dotLottie = new DotLottie({
            canvas:  lottieEl,
        });

        dotLottie.addEventListener("ready", loadSticker);
        dotLottie.addEventListener("load", () => {
            loaded = true;
            if (on_load) on_load();
        });
    });

    $effect(loadSticker);

    function loadSticker() {
        if (sticker) {
            const options = {
                loop: loop,
                autoplay: autoplay,
                renderConfig: {
                    freezeOnOffscreen: true,
                },
            };
            if (sticker instanceof ArrayBuffer) {
                dotLottie.load({
                    data: sticker,
                    ...options
                })
            } else {
                dotLottie.load({
                    src: `src/assets/stickers/${sticker}.lottie`,
                    ...options
                })
            }
        }
    }

    export function play() {
        dotLottie.play();
    }
</script>

<div class="sticker-view" style="width: {size}; height: {size};" class:loaded>
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
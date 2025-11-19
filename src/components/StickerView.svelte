<script lang="ts">
    import {onMount} from "svelte";
    import {fade} from 'svelte/transition';
    import {DotLottie} from "@lottiefiles/dotlottie-web";
    import {stickersInstance} from "./StickerView";
    import {getApplicationContext} from "../lib/navigation/ActivityManager";

    let {
        size,
        sticker = $bindable(),
        loop = false,
        autoplay = false,
        on_load,
        children,
        time_ratio = $bindable(),
    } : {
        size: string
        sticker?: string | ArrayBuffer | Record<string, unknown>,
        loop?: boolean,
        autoplay?: boolean,
        on_load?: () => void,
        children?: any,
        time_ratio?: number,
    } = $props();

    let dotLottie: DotLottie;
    let loaded = $state(false);
    let lottieEl: HTMLCanvasElement;
    let currentElement: HTMLElement;
    let startFrame = $state(0);

    const {getComponentContext} =  getApplicationContext();

    onMount(async () => {
        if (typeof sticker === "string") {
            const {onCapture, onRestore} = getComponentContext(currentElement, sticker);

            onCapture(() => {
                return {
                    currentFrame: dotLottie.currentFrame,
                    totalFrames: dotLottie.totalFrames,
                    duration: dotLottie.duration,
                    pausedAt: Date.now(),
                    isPlaying: dotLottie.isPlaying
                }
            });

            onRestore((state: { currentFrame: number, pausedAt: number, totalFrames: number, duration: number, isPlaying: boolean }) => {
                if (state.isPlaying) {
                    const frameDuration = (state.duration / state.totalFrames) * 1000;
                    const elapsedFrames = Math.floor((Date.now() - state.pausedAt) / frameDuration);
                    startFrame = Math.min(state.currentFrame + elapsedFrames, state.totalFrames - 1);
                } else {
                    startFrame = state.currentFrame;
                }
                if (startFrame == state.totalFrames - 1 && !loop) {
                    autoplay = false;
                }
            });
        }

        dotLottie = new DotLottie({
            canvas:  lottieEl,
        });

        dotLottie.addEventListener("ready", loadSticker);
        dotLottie.addEventListener("load", () => {
            loaded = true;
            if (time_ratio != undefined) {
                dotLottie.setFrame(Math.floor(dotLottie.totalFrames * time_ratio) - 1);
            } else {
                if (startFrame > 0) {
                    dotLottie.setFrame(startFrame);
                }
            }
            if (on_load) on_load();
        });

        function animateToRatio(ratio: number) {
            dotLottie.stop();
            const targetFrame = Math.floor(dotLottie.totalFrames * ratio);
            const startFrame = dotLottie.currentFrame;

            if (targetFrame === startFrame) return;

            if (targetFrame == 0) {
                dotLottie.setFrame(0);
                return;
            }
            dotLottie.play();
        }

        $effect(() => {
            if (!loaded) return;
            if (time_ratio !== undefined) {
                animateToRatio(time_ratio);
            }
        });

        $effect(loadSticker);
    });

    function loadSticker() {
        if (sticker) {
            const options = {
                loop: loop,
                autoplay: autoplay,
                renderConfig: {
                    freezeOnOffscreen: true,
                },
            };
            stickersInstance.getSticker(sticker).then((stickerData) => {
                dotLottie.load({
                    data: stickerData,
                    ...options
                });
            }).catch((error) => {
                console.error("Failed to load sticker:", error);
            });
        }
    }

    export function play() {
        dotLottie.play();
    }
</script>

<div bind:this={currentElement} class="sticker-view" style="width: {size}; height: {size};" class:loaded>
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
        flex-shrink: 0;
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
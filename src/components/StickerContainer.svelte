<script lang="ts">
    import { isiOS } from "../lib/telegram";
    import {onMount} from "svelte";
    import type {TgsPlayer} from "./types";
    const { title, desc, sticker, children } : {title: string, desc: string, sticker:string, children: any} = $props();

    let player: TgsPlayer | undefined = $state();

    let loaded = $state(false);
    onMount(async () => setTimeout(() => {
        player!.addEventListener("ready", () => {
            player!.play();
            loaded = true;
        });
    }, 60));
</script>

<div class="sticker-container" class:isiOS>
    <div class:loaded>
        {@render children?.()}
        <tgs-player
            bind:this={player}
            src="src/assets/stickers/{sticker}.tgs"
            loop>
        </tgs-player>
    </div>
    <h2>{title}</h2>
    <p>{desc}</p>
</div>

<style>
    .sticker-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        padding-block: 20px;
        padding-inline: 30px;
        align-items: center;
    }

    .sticker-container:not(.isiOS) {
        background: var(--tg-theme-section-bg-color);
    }

    .sticker-container > div {
        position: relative;
    }

    .sticker-container > div > :global(svg), tgs-player {
        width: 140px;
        height: 140px;
        transition: opacity 250ms ease-in-out;
    }

    .sticker-container > div.loaded > tgs-player {
        opacity: 1;
    }

    .sticker-container > div.loaded > :global(svg) {
        opacity: 0;
    }

    tgs-player {
        opacity: 0;
    }

    .sticker-container > div > :global(svg) {
        position: absolute;
        opacity: 1;
    }

    h2 {
        color: var(--tg-theme-text-color);
        font-size: 23px;
        margin: 20px 0 0;
        text-align: center;
        font-weight: 500;
    }

    p {
        color: var(--tg-theme-hint-color);
        margin: 10px 0 0;
        font-size: 15px;
        text-align: center;
    }
</style>
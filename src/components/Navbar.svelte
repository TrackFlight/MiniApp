<script lang="ts">
    import {isDesktop, isiOS} from "../lib/telegram";
    import ViewPager from "./ViewPager.svelte";

    let {
        pager,
        tabs = [],
        children
    }: {
        pager?: ViewPager,
        tabs?: string[],
        children?: any
    } = $props();
</script>

<nav class:isiOS class:isDesktop>
    {#each tabs as tab}
        {@const index = tabs.indexOf(tab)}
        {@const isActive = pager?.getCurrentPage() === index}
        <div role="button" class:isActive tabindex="0" onclick={() => {
            pager?.setCurrentPage(index);
        }} onkeydown={(e: KeyboardEvent) => {
            if ((e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                pager?.setCurrentPage(index);
            }
        }}>
            <div>{@render children?.(index)}</div>
            <p>{tab}</p>
        </div>
    {/each}
</nav>

<style>
    nav {
        display: flex;
        height: calc(50px + var(--tg-safe-area-inset-bottom));
        width: 100%;
        background: var(--tg-theme-bottom-bar-bg-color);
        border-top: 1px solid var(--tg-theme-section-separator-color);
        padding-bottom: var(--tg-safe-area-inset-bottom);
        justify-content: space-evenly;
    }

    nav:not(.isiOS) {
        background: var(--tg-theme-section-bg-color);
        height: 62px;
    }

    nav > div {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 90px;
        height: 100%;
    }

    nav > div > div {
        display: flex;
        cursor: pointer;
        align-items: center;
        justify-content: center;
        position: relative;
        width: 100%;
        padding-block: 2px;
        z-index: 0;
        margin-bottom: 2px;
    }

    nav:not(.isiOS) > div > div:before {
        content: "";
        position: absolute;
        width: 0;
        height: 100%;
        border-radius: 30px;
        opacity: 0;
        z-index: -1;
        background: var(--tg-theme-text-color);
        transition: width 150ms cubic-bezier(0.65, 0, 0.35, 1);
    }

    nav:not(.isiOS) > div > div:after {
        content: "";
        position: absolute;
        width: 70%;
        height: 100%;
        border-radius: 30px;
        opacity: 0;
        z-index: -1;
        background: var(--tg-theme-text-color);
        transition: opacity 150ms cubic-bezier(0.65, 0, 0.35, 1);
    }

    /*noinspection CssUnusedSymbol*/
    nav:not(.isiOS).isDesktop > div:not(.isActive):hover > div:after,
    nav:not(:is(.isiOS, .isDesktop)) > div:not(.isActive):active > div:after {
        opacity: 0.05;
    }

    @keyframes pulseBg {
        0% {
            opacity: 0.1;
        }
        25% {
            opacity: 0.2;
        }
        100% {
            opacity: 0.1;
        }
    }

    nav:not(.isiOS) > div.isActive > div:before {
        width: 70%;
        opacity: 0.1;
        animation: pulseBg 300ms ease-in-out;
    }

    nav.isiOS > div > div {
        margin-bottom: 0;
    }

    nav > div > div > :global(svg) {
        width: 26px;
        height: 26px;
        z-index: 0;
        fill: color-mix(in srgb, var(--tg-theme-subtitle-text-color) 70%, transparent);
        transition: fill 150ms ease-in-out;
    }

    nav.isiOS > div > div > :global(svg) {
        width: 28px;
        height: 28px;
        fill: var(--tg-theme-subtitle-text-color);
    }

    @keyframes pulseSvg {
        0% {
            transform: scale(1);
        }
        25% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
        }
    }

    nav.isiOS > div.isActive > div > :global(svg) {
        fill: var(--tg-theme-accent-text-color);
        animation: pulseSvg 300ms ease-in-out;
    }

    nav:not(.isiOS) > div.isActive > div > :global(svg) {
        fill: var(--tg-theme-text-color);
    }

    nav > div > p {
        margin: 0;
        font-size: 12px;
        font-weight: 600;
        color: color-mix(in srgb, var(--tg-theme-subtitle-text-color) 70%, transparent);
        transition: color 150ms ease-in-out;
    }

    nav.isiOS > div > p {
        font-size: 10px;
        font-weight: 500;
        color: var(--tg-theme-subtitle-text-color);
    }

    nav.isiOS > div.isActive > p {
        color: var(--tg-theme-accent-text-color);
    }

    nav:not(.isiOS) > div.isActive > p {
        color: var(--tg-theme-text-color);
    }
</style>
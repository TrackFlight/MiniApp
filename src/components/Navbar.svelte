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

    let touchedIndex = $state(0);
    let isTouched = $state(false);
</script>

<div class="nav-container">
    <nav class:isiOS class:isDesktop style="--navbar-page: {isTouched ? touchedIndex : pager?.getCurrentPage()}" class:isTouched>
        <!--<div class="nav_sel"></div>-->
        {#each tabs as tab}
            {@const index = tabs.indexOf(tab)}
            {@const isActive = isTouched ? touchedIndex === index : pager?.getCurrentPage() === index}
            <!--suppress HtmlUnknownAttribute -->
            <div role="button" class:isActive tabindex="0" ontouchstart={() => {
                if (!isiOS) return;
                isTouched = true
                touchedIndex = index;
            }} ontouchend={() => {
                if (!isiOS) return;
                setTimeout(() => {
                    isTouched = false;
                }, 150)
                pager?.setCurrentPage(index);
            }} ontouchcancel={() => setTimeout(() => {
                if (!isiOS) return;
                isTouched = false;
            }, 150)} onclick={() => {
                if (isiOS) return;
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
</div>

<style>
    .nav-container {
        display: block;
        position: absolute;
        bottom: 0;
        width: 100%;
        --width-navitem: 90px;
    }

    nav {
        display: flex;
        position: relative;
        margin-inline: auto;
        height: 50px;
        width: 100%;
        border-top: 1px solid var(--tg-theme-section-separator-color);
        padding-bottom: var(--tg-safe-area-inset-bottom);
        justify-content: space-evenly;
    }

    nav.isiOS:before {
        content: '';
        backdrop-filter: blur(2px) saturate(300%);
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: inherit;
        background: color-mix(in srgb, var(--tg-theme-bottom-bar-bg-color) 85%, transparent 15%);
        /*noinspection CssNonIntegerLengthInPixels*/
        box-shadow: 0.5px 0.5px 0 rgba(255, 255, 255, 0.2), -0.5px -0.5px 0 rgba(255, 255, 255, 0.2);
        transition: 200ms cubic-bezier(0.65, 0, 0.35, 1);
    }

    nav.isiOS:after {
        content: '';
        position: absolute;
        border-radius: inherit;
        background: rgba(255, 255, 255, 0.13);
        left: 0;
        width: calc(var(--width-navitem) - 6px);
        margin-left: 3px;
        margin-top: 3px;
        height: calc(100% - 6px);
        transition: 200ms cubic-bezier(0.65, 0, 0.35, 1);
        transform: translateX(calc(var(--width-navitem) * var(--navbar-page)));
    }

    nav.isiOS.isTouched:after {
        transform: translateX(calc(var(--width-navitem) * var(--navbar-page))) scale(1.25);
        backdrop-filter: blur(2px) saturate(300%);
        background: transparent;
        /*noinspection CssNonIntegerLengthInPixels*/
        box-shadow: 0.5px 0.5px 0 rgba(255, 255, 255, 0.2), -0.5px -0.5px 0 rgba(255, 255, 255, 0.2);
    }

    nav.isiOS {
        padding-bottom: 0;
        width: fit-content;
        height: 60px;
        border-top: 0;
        margin-bottom: var(--tg-safe-area-inset-bottom);
        transition: transform 300ms cubic-bezier(0.65, 0, 0.35, 1);
        border-radius: 100px;
    }

    nav.isiOS.isTouched {
        transform: scale(1.08);
    }

    nav:not(.isiOS) {
        background: var(--tg-theme-section-bg-color);
        height: 62px;
    }

    nav.isDesktop {
        background: var(--tg-theme-section-bg-color);
    }

    nav > div {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: var(--width-navitem);
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
        z-index: 1;
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
        fill: color-mix(in srgb, var(--tg-theme-text-color) 35%, transparent);
        transition: fill 150ms ease-in-out;
    }

    nav.isiOS > div > div > :global(svg) {
        width: 28px;
        height: 28px;
    }

    nav.isiOS > div.isActive > div > :global(svg) {
        fill: var(--tg-theme-accent-text-color);
    }

    nav:not(.isiOS) > div.isActive > div > :global(svg) {
        fill: var(--tg-theme-text-color);
    }

    nav > div > p {
        margin: 0;
        font-size: 12px;
        font-weight: 600;
        color: color-mix(in srgb, var(--tg-theme-text-color) 35%, transparent);
        transition: color 150ms ease-in-out;
    }

    nav.isiOS > div > div > :global(svg) {
        fill: var(--tg-theme-text-color);
    }

    nav.isiOS > div > p {
        color: var(--tg-theme-text-color);
    }

    nav.isDesktop.isiOS > div > p {
        display: none;
    }

    nav.isiOS > div > p {
        font-size: 10px;
        font-weight: 500;
        z-index: 1;
    }

    nav.isiOS > div.isActive > p {
        color: var(--tg-theme-accent-text-color);
    }

    nav:not(.isiOS) > div.isActive > p {
        color: var(--tg-theme-text-color);
    }
</style>
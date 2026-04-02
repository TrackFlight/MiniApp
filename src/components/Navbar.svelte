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
    let feImageEl: SVGFEImageElement;
    let navbarElement: HTMLElement;

    function generatePillNormalMap(width: number, height: number): string {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        const r = height / 2;
        ctx.beginPath();
        ctx.roundRect(0, 0, width, height, r);
        ctx.clip();
        const vGrad = ctx.createLinearGradient(0, 0, 0, height);
        vGrad.addColorStop(0,    'rgb(218, 254, 218)');
        vGrad.addColorStop(0.10, 'rgb(122, 222,  74)');
        vGrad.addColorStop(0.20, 'rgb(113, 193,  16)');
        vGrad.addColorStop(0.40, 'rgb(131, 163,   2)');
        vGrad.addColorStop(0.50, 'rgb(144, 146,   0)');
        vGrad.addColorStop(0.70, 'rgb(172, 120,   2)');
        vGrad.addColorStop(0.80, 'rgb(178,  99,   4)');
        vGrad.addColorStop(0.90, 'rgb(163,  56,  12)');
        vGrad.addColorStop(1.0,  'rgb(133,  94,  95)');
        ctx.fillStyle = vGrad;
        ctx.fillRect(0, 0, width, height);
        ctx.shadowColor = 'rgba(255, 255, 255, 1)';
        ctx.shadowBlur  = height * 0.26;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.roundRect(1, 1, width - 2, height - 2, r - 1);
        ctx.stroke();

        return canvas.toDataURL('image/png');
    }

    function updateNormalMap() {
        if (!feImageEl || !navbarElement) return;

        const rect = navbarElement.getBoundingClientRect();
        const width = Math.ceil(rect.width);
        const height = Math.ceil(rect.height);

        if (width <= 0 || height <= 0) return;

        feImageEl.setAttribute('href', generatePillNormalMap(width, height));
    }

    $effect(() => {
        if (!navbarElement || !feImageEl) return;
        updateNormalMap();
        const resizeObserver = new ResizeObserver(() => {
            updateNormalMap();
        });
        resizeObserver.observe(navbarElement);
        return () => {
            resizeObserver.disconnect();
        };
    });
</script>

<div class="nav-container" style="--navbar-page: {isTouched ? touchedIndex : pager?.getCurrentPage()}; --page-count: {tabs.length}">
    <nav class:isiOS class:isDesktop class:isTouched bind:this={navbarElement}>
        <div class="glass-filter">
            <svg>
                <filter id="apple-glass" primitiveUnits="objectBoundingBox">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="0.05" result="blurred_source"></feGaussianBlur>
                    <feImage bind:this={feImageEl} result="map"
                             width="100%" height="100%" x="0" y="0" href="" />
                    <feDisplacementMap in="blurred_source" in2="displacement_map" scale="0.2" xChannelSelector="R" yChannelSelector="G" result="displaced"></feDisplacementMap>
                    <feColorMatrix in="displaced" type="saturate" result="displaced_saturated" values="6"></feColorMatrix>
                    <feComposite in="displaced_saturated" in2="specular_layer" operator="in" result="specular_saturated"></feComposite>
                    <feComponentTransfer in="specular_layer" result="specular_faded"><feFuncA type="linear" slope="0.4"></feFuncA></feComponentTransfer>
                    <feBlend in="specular_saturated" in2="displaced" mode="normal" result="withSaturation"></feBlend>
                    <feBlend in="specular_faded" in2="withSaturation" mode="normal"></feBlend>
                </filter>
            </svg>
        </div>
        <div class="nav_glare" class:isiOS class:isDesktop class:isTouched></div>
        <div class="nav_glare2" class:isiOS class:isDesktop class:isTouched></div>
        {#each tabs as tab}
            {@const index = tabs.indexOf(tab)}
            {@const isActive = isTouched ? touchedIndex === index : pager?.getCurrentPage() === index}
            <!--suppress HtmlUnknownAttribute -->
            <div class="button_container" role="button" class:isiOS class:isDesktop class:isActive tabindex="0" ontouchstart={() => {
                if (!isiOS|| isDesktop) return;
                isTouched = true
                touchedIndex = index;
            }} ontouchend={() => {
                if (!isiOS || isDesktop) return;
                setTimeout(() => {
                    isTouched = false;
                }, 150)
                pager?.setCurrentPage(index);
            }} ontouchcancel={() => {
                if (!isiOS || isDesktop) return;
                setTimeout(() => {
                    isTouched = false;
                }, 150)
            }} onclick={() => {
                if (isiOS && !isDesktop) return;
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
        display: flex;
        justify-content: center;
        position: absolute;
        bottom: 0;
        width: 100%;
        --width-navitem: 90px;
    }

    nav {
        display: flex;
        position: relative;
        height: 50px;
        width: 100%;
        border-top: 1px solid var(--tg-theme-section-separator-color);
        padding-bottom: var(--tg-safe-area-inset-bottom);
        justify-content: space-evenly;
    }

    nav:not(.isiOS):not(.isDesktop) {
        margin-bottom: 4px;
    }

    .nav_glare, .nav_glare2 {
        display: none;
    }

    .nav_glare.isiOS:not(.isDesktop), .nav_glare2.isiOS:not(.isDesktop) {
        display: block;
        position: absolute;
        clip-path: inset(0 round 40px);
        width: calc(var(--width-navitem) * var(--page-count));
        height: 100%;
        border-radius: inherit;
        pointer-events: none;
        mix-blend-mode: overlay;
    }

    .nav_glare.isiOS:not(.isDesktop) {
        z-index: 2;
    }

    .nav_glare.isiOS:not(.isDesktop):before {
        content: '';
        position: absolute;
        transition: 200ms cubic-bezier(0.65, 0, 0.35, 1);
        width: calc(var(--width-navitem) * calc(var(--page-count) + 2));
        height: 100%;
        transform: translateX(calc(var(--width-navitem) * -1 * calc(calc(var(--page-count) - 1) - var(--navbar-page))));
        opacity: 0;
        background: linear-gradient(to right, transparent, white 33%, white 33%, transparent);
    }

    .nav_glare2.isiOS:not(.isDesktop):before {
        content: '';
        position: absolute;
        transition: 200ms cubic-bezier(0.65, 0, 0.35, 1);
        width: calc(var(--width-navitem) * calc(var(--page-count) + 2));
        height: 100%;
        transform: translateX(calc(var(--width-navitem) * -1 * calc(calc(var(--page-count) - 1) - var(--navbar-page))));
        background: linear-gradient(to right, transparent, white 33%, transparent, transparent);
        opacity: 0;
    }

    .nav_glare2.isiOS:not(.isDesktop).isTouched:before {
        opacity: 0.06;
    }

    .nav_glare.isiOS:not(.isDesktop).isTouched:before {
        opacity: 0.75;
    }

    nav:not(.isDesktop):before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: inherit;
        background: color-mix(in srgb, color-mix(in srgb, var(--tg-theme-section-bg-color) 97%, white) 85%, transparent);
        backdrop-filter: url(#apple-glass);

        /*noinspection CssNonIntegerLengthInPixels*/
        box-shadow: 0.5px 0.5px 0 var(--tg-theme-liquid-glass-border), -0.5px -0.5px 0 var(--tg-theme-liquid-glass-border);
        transition: 200ms cubic-bezier(0.65, 0, 0.35, 1);
    }

    nav.isiOS:not(.isDesktop):before {
        backdrop-filter: blur(2px) saturate(100%);
        background: color-mix(in srgb, color-mix(in srgb, var(--tg-theme-bg-color) 91%, white) 85%, transparent);
    }

    nav.isiOS:not(.isDesktop):after {
        content: '';
        position: absolute;
        border-radius: inherit;
        background: var(--tg-theme-navbar-selected);
        left: 0;
        width: calc(var(--width-navitem) - 6px);
        margin-left: 3px;
        margin-top: 3px;
        height: calc(100% - 6px);
        transition: 200ms cubic-bezier(0.65, 0, 0.35, 1);
        transform: translateX(calc(var(--width-navitem) * var(--navbar-page))) scale(1);
    }

    nav.isiOS:not(.isDesktop).isTouched:after {
        transform: translateX(calc(var(--width-navitem) * var(--navbar-page))) scale(1.25);
        backdrop-filter: blur(2px) saturate(100%);
        background: transparent;
        /*noinspection CssNonIntegerLengthInPixels*/
        box-shadow: 0.5px 0.5px 0 var(--tg-theme-liquid-glass-border), -0.5px -0.5px 0 var(--tg-theme-liquid-glass-border);
    }

    nav:not(.isDesktop) {
        padding-bottom: 0;
        width: fit-content;
        height: 60px;
        border-top: 0;
        margin-bottom: var(--tg-safe-area-inset-bottom);
        transition: transform 300ms cubic-bezier(0.65, 0, 0.35, 1);
        border-radius: 100px;
    }

    nav.isiOS.isDesktop {
        height: 52px;
    }

    nav.isiOS:not(.isDesktop).isTouched {
        transform: scale(1.08);
    }

    nav.isDesktop {
        background: var(--tg-theme-section-bg-color);
        height: 62px;
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

    nav:not(.isiOS).isDesktop > div > div:after {
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

    .button_container:not(.isiOS):not(.isDesktop) {
        position: relative;
    }

    .button_container:not(.isiOS):not(.isDesktop):after {
        content: "";
        position: absolute;
        inset: 4px;
        border-radius: 30px;
        opacity: 0;
        background: var(--tg-theme-button-color);
        transform: scale(0.5);
        transform-origin: center center;
        transition:
                transform 320ms cubic-bezier(0.22, 1, 0.36, 1),
                opacity 220ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .button_container:not(.isiOS):not(.isDesktop).isActive:after {
        transform: scale(1);
        opacity: 0.15;
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

    nav:not(.isiOS).isDesktop > div.isActive > div:before {
        width: 70%;
        opacity: 0.1;
        animation: pulseBg 300ms ease-in-out;
    }

    nav:not(.isDesktop) > div > div {
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

    /*noinspection CssUnusedSymbol*/
    nav:not(.isDesktop) > div > div > :global(.user-icon) {
        width: 24px;
        height: 24px;
        margin: 2px 0;
    }

    nav.isiOS.isDesktop > div > div > :global(svg) {
        fill: color-mix(in srgb, var(--tg-theme-text-color) 50%, transparent);
    }

    nav:not(.isDesktop) > div.isActive > div > :global(svg) {
        fill: var(--tg-theme-accent-text-color);
    }

    nav:not(.isDesktop):not(.isiOS) > div.isActive > div > :global(svg) {
        fill: var(--tg-theme-button-color);
    }

    nav.isDesktop > div.isActive > div > :global(svg) {
        fill: var(--tg-theme-text-color);
    }

    nav > div > p {
        margin: 0;
        font-size: 12px;
        font-weight: 600;
        color: color-mix(in srgb, var(--tg-theme-text-color) 35%, transparent);
        transition: color 150ms ease-in-out;
    }

    nav:not(.isDesktop) > div > div > :global(svg) {
        fill: var(--tg-theme-text-color);
    }

    nav:not(.isDesktop) > div > p {
        color: var(--tg-theme-text-color);
    }

    nav.isDesktop.isiOS > div > p {
        display: none;
    }

    nav.isiOS > div > p {
        font-size: 10px;
        font-weight: 500;
    }

    nav:not(.isDesktop) > div > p {
        z-index: 1;
    }

    nav:not(.isDesktop) > div.isActive > p {
        color: var(--tg-theme-accent-text-color);
    }

    nav:not(.isDesktop):not(.isActive) > div.isActive > p {
        color: var(--tg-theme-button-color);
    }

    nav.isDesktop > div.isActive > p {
        color: var(--tg-theme-text-color);
    }

    .glass-filter {
        position: absolute;
        width: 0;
        height: 0;
        z-index: -1;
    }
</style>
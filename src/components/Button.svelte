<!--suppress CssUnusedSymbol -->
<script lang="ts">
    import { isiOS, isDesktop } from "../lib/telegram";
    import { fade, slide } from 'svelte/transition';

    let {
        type,
        text,
        children,
        on_click
    } : {
        type?: string,
        text?: string,
        children?: any,
        on_click?: () => void
    } = $props();

    let displayText = $derived(!isiOS && text ? text.toUpperCase() : text);
    type = type || 'default';
    if (text) {
        type = 'text';
    }
    const styles = type.split(' ');

    function onKey(e: KeyboardEvent) {
        if ((e.key === "Enter" || e.key === " ") && on_click) {
            e.preventDefault();
            on_click();
        }
    }

    function handleClick(e: MouseEvent) {
        if (on_click) {
            const target = e.target as HTMLElement;
            if (target.closest('.button') !== rippleHandler) {
                return;
            }
            e.preventDefault();
            on_click();
        }
    }

    let rippleHandler: HTMLElement;
    function onRippleStart(e: MouseEvent | TouchEvent) {
        if ((e instanceof MouseEvent && !isDesktop && styles.includes('opaque')) || isiOS) {
            return;
        }
        const target = e.target as HTMLElement;
        if (target.closest('.button') !== rippleHandler) {
            return;
        }

        let clientY;
        let clientX;
        const rippleMask = rippleHandler.querySelector('.ripple-mask') as HTMLElement;
        const rect = rippleMask.getBoundingClientRect();

        if (e instanceof TouchEvent) {
            clientX = e.targetTouches[0].clientX;
            clientY = e.targetTouches[0].clientY;
        } else if (e instanceof MouseEvent) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            return;
        }
        const rippleX = (clientX - rect.left) - rippleMask.offsetWidth / 2;
        const rippleY = (clientY - rect.top) - rippleMask.offsetHeight / 2;
        const ripple = rippleHandler.querySelector('.ripple') as HTMLElement;
        ripple.style.transition = 'none';
        ripple.offsetTop + 1;
        ripple.style.transform = 'translate3d(' + rippleX + 'px, ' + rippleY + 'px, 0) scale3d(0.2, 0.2, 1)';
        ripple.style.opacity = "1";
        ripple.offsetTop + 1;
        ripple.style.transform = 'translate3d(' + rippleX + 'px, ' + rippleY + 'px, 0) scale3d(1, 1, 1)';
        ripple.style.transition = '';

        function onRippleEnd() {
            ripple.style.transitionDuration = 'var(--ripple-end-duration, .2s)';
            ripple.style.opacity = "0";
            if (e instanceof TouchEvent) {
                document.removeEventListener('touchend', onRippleEnd);
                document.removeEventListener('touchcancel', onRippleEnd);
            } else {
                document.removeEventListener('mouseup', onRippleEnd);
            }
        }

        if (e instanceof TouchEvent) {
            document.addEventListener('touchend', onRippleEnd);
            document.addEventListener('touchcancel', onRippleEnd);
        } else {
            document.addEventListener('mouseup', onRippleEnd);
        }
    }
</script>

<div transition:fade={{ duration: 150 }}
     bind:this={rippleHandler}
     class="button {styles.join(' ')}"
     class:isiOS
     class:isDesktop
     role="button"
     tabindex="0"
     onclick={handleClick}
     ontouchstart={onRippleStart}
     onmousedown={onRippleStart}
     onkeydown={onKey}>
    {#if !isiOS && !styles.includes('opaque')}
        <span class="ripple-mask"><span class="ripple"></span></span>
    {/if}
    <div>
        {#if type === 'text' && text}
            <span transition:slide={{ duration: 150 }} class="sizer">{displayText}</span>
            {#key text}
                <span class="fade-text" class:isiOS transition:fade={{ duration: 150 }}>
                    {displayText}
                </span>
            {/key}
        {:else}
            {@render children?.()}
        {/if}
    </div>
</div>

<style>
    .button {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        position: relative;
        user-select: none;
        overflow: hidden;
        --tap-scale: 0.97;
        --ripple-duration: .45s;
        --ripple-end-duration: .3s;
    }

    .button > .ripple-mask {
        position: absolute;
        left: 0; right: 0;
        top: 0; bottom: 0;
        transform: translateZ(0);
        overflow: hidden;
        opacity: 0.04;
        border-radius: inherit;
    }

    .button > .ripple-mask > .ripple {
        position: absolute;
        width: 200%;
        left: 50%; top: 50%;
        margin: -100% 0 0 -100%;
        padding-top: 200%;
        border-radius: 50%;
        background-color:  var(--tg-theme-text-color);

        transition:
                transform var(--ripple-duration) ease-out,
                opacity var(--ripple-duration) ease-out,
                background-color var(--ripple-duration) ease-out;
        opacity: 0;
    }

    .button:is(.text, .accent) > .ripple-mask > .ripple {
        background-color:  var(--tg-theme-accent-text-color);
    }

    .button.rounded {
        border-radius: 6px;
    }

    .button.circle {
        border-radius: 50%;
    }

    .sizer {
        visibility: hidden;
        white-space: nowrap;
    }

    .fade-text {
        position: absolute;
        top: 0;
        left: 0;
        font-weight: 500;
        color: var(--tg-theme-accent-text-color);
    }

    .fade-text.isiOS {
        font-weight: normal;
    }

    .button:not(.default).text {
        font-size: 18px;
        padding-inline: 15px;
        padding-block: 6px;
        border-radius: 10px;
        color: var(--tg-theme-accent-text-color);
    }

    .button:not(.isiOS).text > div {
        font-size: 15px;
    }

    .button > div {
        transition: transform 140ms ease-out;
        transform-origin: center;
        display: flex;
        align-items: center;
        position: relative;
        width: 100%;
    }

    .button::after {
        content: "";
        position: absolute;
        inset: 0;
        background: var(--tg-theme-text-color);
        opacity: 0;
        transition: opacity 120ms ease-out;
        pointer-events: none;
    }

    .button:not(.isiOS):is(.text, .accent)::after {
        background: var(--tg-theme-accent-text-color);
    }

    .button:not(.opaque):not(.isiOS).isDesktop:hover::after,
    .button:is(.default, .text):not(.isDesktop):not(.isiOS):active::after {
        opacity: 0.05;
    }

    .button.isiOS:is(.opaque, .text) {
        transition: opacity 120ms ease-out;
    }

    .button.isiOS:active:is(.opaque, .text) {
        opacity: 0.4;
    }

    .button.default:not(.text).isiOS:active > div {
        transform: scale(var(--tap-scale));
    }
</style>
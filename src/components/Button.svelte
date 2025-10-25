<script lang="ts">
    import {isDesktop, isiOS} from "../lib/telegram";
    import {fade} from 'svelte/transition';
    import RippleEffect from "./RippleEffect.svelte";

    let {
        text,
        on_click,
        secondary = false,
        undo = false,
        accent = 'var(--tg-theme-accent-text-color)',
        destructive = false,
        disabled = false,
    } : {
        text?: string,
        on_click?: () => void,
        secondary?: boolean,
        undo?: boolean,
        accent?: string,
        destructive?: boolean,
        disabled?: boolean,
    } = $props();

    const displayText = $derived(!isiOS && text && secondary ? text.toUpperCase() : text);

    function onKey(e: KeyboardEvent) {
        if ((e.key === "Enter" || e.key === " ") && on_click && !disabled) {
            e.preventDefault();
            on_click();
        }
    }

    function handleClick(e: MouseEvent) {
        if (on_click && !disabled) {
            e.preventDefault();
            on_click();
        }
    }
</script>

<div style="--accent-color: {accent}" class="button clickable" class:isDesktop class:isiOS class:disabled class:destructive class:secondary role="button" tabindex="0" onclick={handleClick} onkeydown={onKey}>
    {#if !isiOS}
        <RippleEffect rippleColor="color-mix(in srgb, {secondary ? 'var(--accent-color)' : 'black'} {secondary ? '8':'15'}%, transparent)"/>
    {/if}
    {#if undo}
        {#if !isiOS}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                <path d="M320-200q-17 0-28.5-11.5T280-240q0-17 11.5-28.5T320-280h244q63 0 109.5-40T720-420q0-60-46.5-100T564-560H312l76 76q11 11 11 28t-11 28q-11 11-28 11t-28-11L188-572q-6-6-8.5-13t-2.5-15q0-8 2.5-15t8.5-13l144-144q11-11 28-11t28 11q11 11 11 28t-11 28l-76 76h252q97 0 166.5 63T800-420q0 94-69.5 157T564-200H320Z"/>
            </svg>
        {/if}
        <p>{displayText}</p>
    {:else}
        <span class="sizer">{displayText}</span>
        {#key text}
        <span class="fade-text" transition:fade={{ duration: 150 }}>
            {displayText}
        </span>
        {/key}
    {/if}
</div>

<style>
    .button {
        gap: 6px;
        display: flex;
        position: relative;
        overflow: hidden;
        padding-inline: 15px;
        padding-block: 12px;
        cursor: pointer;
        flex-shrink: 0;
        z-index: 0;
    }

    .button.isiOS:not(.secondary):not(.destructive)::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 5;
        border-radius: inherit;
        box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.4), inset 0 0 3px rgba(255, 255, 255, 1);
        opacity: 1;
        mix-blend-mode: overlay;
        pointer-events: none;
    }

    .button:has(svg) {
        padding-inline: 10px;
        padding-block: 6px;
    }

    .button:not(.isiOS):not(.secondary),
    .button:not(.secondary):not(.destructive).isiOS {
        background: var(--accent-color);
    }

    .button.secondary.isiOS {
        padding-block: 10px;
    }

    .button:not(.secondary), .button:has(svg) {
        align-items: center;
        justify-content: center;
    }

    .button:is(.isDesktop, .isiOS):not(.secondary):before,
    .button.isDesktop:not(.isiOS).secondary:before {
        content: '';
        position: absolute;
        inset: 0;
        background: black;
        opacity: 0;
        border-radius: inherit;
        transition: opacity 150ms ease-out;
    }

    .button:is(.isDesktop, .isiOS):not(.destructive):not(.secondary):before {
        background: white;
        mix-blend-mode: overlay;
    }

    .button.isDesktop:not(.isiOS).secondary:before {
        background: var(--accent-color);
    }

    .button.isiOS:not(.secondary):active:not(.disabled):before {
        opacity: 0.2;
        z-index: 1;
    }

    .button.isiOS:not(.secondary):not(.destructive):not(.disabled):active:before {
        opacity: 0.3;
    }

    .button.isDesktop:not(.isiOS):hover:before {
        opacity: 0.1;
    }

    .button.isiOS:not(.secondary) {
        padding-block: 14px;
        border-radius: 50px;
    }

    .button:not(.isiOS) {
        border-radius: 6px;
    }

    .sizer {
        visibility: hidden;
        white-space: nowrap;
    }

    .fade-text {
        position: absolute;
        font-weight: 500;
        margin: 0;
    }

    .button:not(.isiOS):not(.secondary) > .fade-text {
        color: white;
        font-size: 14px;
        font-weight: 600;
    }

    .button:not(.isiOS).secondary > .fade-text {
        font-size: 15px;
        color: var(--accent-color);
    }

    .button.secondary.isiOS:active > :is(.fade-text, p) {
        opacity: 0.4;
    }

    .button.disabled > .fade-text {
        opacity: 0.5;
    }

    .button.isiOS > .fade-text {
        color: white;
        font-weight: 500;
        font-size: 17px;
    }

    .button.isiOS.destructive > .fade-text {
        color: var(--accent-color);
        font-weight: normal;
    }

    .button.secondary.isiOS > .fade-text {
        font-size: 18px;
        transition: opacity 120ms ease-out;
    }

    .button > svg {
        min-width: 24px;
        fill: var(--accent-color);
        transform: rotate(0deg) translateY(-1px);
    }

    .button > p {
        margin: 0;
        color: var(--accent-color);
    }

    .button.isiOS > p {
        font-size: 16px;
        font-weight: 500;
        transition: opacity 120ms ease-out;
    }

    .button:not(.isiOS) > p {
        font-size: 14px;
        font-weight: 600;
    }
</style>
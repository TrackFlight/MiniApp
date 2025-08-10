<script lang="ts">
    import {isiOS} from "../lib/telegram";

    let {
        on_change,
        defaultState = false,
        switchLocked = false
    } : {
        on_change?: (checked: boolean) => void,
        defaultState?: boolean,
        switchLocked?: boolean,
    } = $props();
    
    let switchElement: HTMLInputElement;

    function on_switch_change(event: Event) {
        if (!on_change || switchLocked) return;
        on_change((event.target as HTMLInputElement).checked);
    }

    export function toggle() {
        switchElement.checked = !switchElement.checked && !switchLocked;
        if (on_change && !switchLocked) on_change(switchElement.checked);
    }
</script>

<label class="switch button" class:isiOS>
    <input type="checkbox" bind:this={switchElement} onchange={on_switch_change} defaultChecked={defaultState && !switchLocked} disabled={switchLocked}/>
    {#if switchLocked}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26.5381 38.7451">
            <path d="M4.44336 37.7441L21.7529 37.7441C24.707 37.7441 26.1963 36.2305 26.1963 33.0322L26.1963 20.166C26.1963 16.9922 24.707 15.4785 21.7529 15.4785L4.44336 15.4785C1.48926 15.4785 0 16.9922 0 20.166L0 33.0322C0 36.2305 1.48926 37.7441 4.44336 37.7441ZM3.32031 17.1631L6.7627 17.1631L6.7627 10.3271C6.7627 5.59082 9.81445 3.27148 13.0859 3.27148C16.3818 3.27148 19.458 5.59082 19.458 10.3271L19.458 17.1631L22.9004 17.1631L22.9004 10.8154C22.9004 3.34473 17.9932 0 13.0859 0C8.20312 0 3.32031 3.34473 3.32031 10.8154Z" fill="var(--unactive-color)"/>
        </svg>
    {/if}
</label>

<style>
    .switch {
        cursor: pointer;
        --switch-width: 30px;
        --switch-height: 14px;
        --unactive-color: color-mix(in srgb, var(--tg-theme-subtitle-text-color) 80%, var(--tg-theme-secondary-bg-color));
        display: flex;
        height: var(--switch-height);
        border-radius: 7px;
        background-color: var(--unactive-color);
        align-items: center;
        width: var(--switch-width);
        min-width: var(--switch-width);
        transition: 225ms cubic-bezier(0.65, 0, 0.35, 1);
    }

    .switch.isiOS {
        --switch-width: 52px;
        --switch-height: 32px;
        padding: 2px;
        border-radius: 17px;
        background-color: color-mix(in srgb, var(--tg-theme-text-color) 15%, transparent);
    }

    .switch > svg {
        position: absolute;
        z-index: 1;
        width: 10px;
        transform: translateX(9px);
    }

    .switch:not(.isiOS) > svg {
        width: 8px;
        transform: translateX(2px);
    }

    input {
        opacity: 0;
        width: 0;
        height: 0;
        position: absolute;
    }

    .switch:before {
        content: "";
        aspect-ratio: 1 / 1;
        border-radius: 50%;
        transition: 225ms cubic-bezier(0.65, 0, 0.35, 1);
    }

    .switch:not(.isiOS):before {
        height: calc(var(--switch-height) + 6px);
        background-color: var(--unactive-color);
        transform: translateX(-4px);
    }

    .switch.isiOS:before {
        height: 100%;
        background-color: white;
        filter: drop-shadow(0px 3px 1px rgba(0, 0, 0, 0.06))
        drop-shadow(0px 3px 8px rgba(0, 0, 0, 0.15))
        drop-shadow(0px 0px 0px rgba(0, 0, 0, 0.04));
    }

    .switch:after {
        content: "";
        aspect-ratio: 1 / 1;
        border-radius: 50%;
    }

    .switch:not(.isiOS):after {
        position: absolute;
        transform: translateX(-2px);
        height: calc(var(--switch-height) + 2px);
        background-color: var(--tg-theme-section-bg-color);
        transition: 225ms cubic-bezier(0.65, 0, 0.35, 1);
    }

    .switch.isiOS:has(input:checked) {
        background-color: #42d450;
    }

    .switch:not(.isiOS):has(input:checked) {
        background-color: var(--tg-theme-button-color);
    }

    .switch:not(.isiOS):has(input:checked):before {
        background-color: var(--tg-theme-button-color);
    }

    .switch.isiOS:has(input:checked):before {
        transform: translateX(calc(var(--switch-width) - var(--switch-height)));
    }

    .switch:not(.isiOS):has(input:checked):before {
        transform: translateX(calc(var(--switch-width) - var(--switch-height) - 2px));
    }

    .switch:not(.isiOS):has(input:checked):after {
        transform: translateX(calc(var(--switch-width) - var(--switch-height)));
    }
</style>
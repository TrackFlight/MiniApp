<script lang="ts">
    import {isiOS} from "../lib/telegram";
    let {
        on_change,
        defaultState = false,
    } : {
        on_change?: (checked: boolean) => void;
        defaultState?: boolean;
    } = $props();
    
    let switchElement: HTMLInputElement;

    function on_switch_change(event: Event) {
        if (!on_change) return;
        on_change((event.target as HTMLInputElement).checked);
    }

    export function toggle() {
        switchElement.checked = !switchElement.checked;
        if (on_change) on_change(switchElement.checked);
    }
</script>

<label class="switch button" class:isiOS>
    <input type="checkbox" bind:this={switchElement} onchange={on_switch_change} defaultChecked={defaultState}/>
</label>

<style>
    .switch {
        --switch-width: 30px;
        --switch-height: 14px;
        --unactive-color: color-mix(in srgb, var(--tg-theme-hint-color) 80%, var(--tg-theme-secondary-bg-color));
        display: flex;
        height: var(--switch-height);
        border-radius: 7px;
        background-color: var(--unactive-color);
        align-items: center;
        width: var(--switch-width);
        min-width: var(--switch-width);
        transition: 225ms cubic-bezier(0.55, 0, 0.1, 1);
    }

    .switch.isiOS {
        --switch-width: 52px;
        --switch-height: 32px;
        padding: 2px;
        border-radius: 17px;
        background-color: color-mix(in srgb, var(--tg-theme-text-color) 15%, transparent);
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
        transition: 225ms cubic-bezier(0.55, 0, 0.1, 1);
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
        transition: 225ms cubic-bezier(0.55, 0, 0.1, 1);
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
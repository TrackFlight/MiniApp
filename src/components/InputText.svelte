<script lang="ts">
    import {isiOS} from "../lib/telegram";
    import {onDestroy, onMount} from "svelte";

    let {
        hint,
        search = false,
        text = $bindable<string>()
    } : {hint: string, search?: boolean, text: string} = $props();

    let searchBar: HTMLDivElement;
    let inputValue = $state(text);
    let backgroundColor = $state('transparent');

    function findBackgroundColor(el: HTMLElement): string {
        let current: HTMLElement | null = el;
        while (current) {
            const bg = getComputedStyle(current).backgroundColor;
            if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                return bg;
            }
            current = current.parentElement;
        }
        return 'transparent';
    }

    onMount(() => {
        const updateBg = () => {
            const foundColor = findBackgroundColor(searchBar);
            if (foundColor !== backgroundColor) {
                backgroundColor = foundColor;
            }
        };

        updateBg();

        const observer = new MutationObserver(updateBg);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["style", "class"],
            subtree: true
        });

        onDestroy(() => observer.disconnect());
    })

    $effect(() => {
        text = inputValue;
    });
</script>

<div class="search-bar" class:isiOS class:has-input={inputValue.length > 0} bind:this={searchBar} style="--background-parent: {backgroundColor}">
    {#if search}
        {#if isiOS}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38.0371 38.0615">
                <path d="M0 15.5273C0 24.0967 6.95801 31.0303 15.5273 31.0303C18.8232 31.0303 21.8506 30.0049 24.3652 28.2471L33.4473 37.3535C33.96 37.8418 34.5947 38.0615 35.2539 38.0615C36.6699 38.0615 37.6953 36.9873 37.6953 35.5713C37.6953 34.8877 37.4268 34.2773 37.0117 33.8135L27.9785 24.7559C29.9072 22.168 31.0303 18.9941 31.0303 15.5273C31.0303 6.95801 24.0967 0 15.5273 0C6.95801 0 0 6.95801 0 15.5273ZM3.75977 15.5273C3.75977 9.00879 9.00879 3.75977 15.5273 3.75977C22.0215 3.75977 27.2949 9.00879 27.2949 15.5273C27.2949 22.0215 22.0215 27.2949 15.5273 27.2949C9.00879 27.2949 3.75977 22.0215 3.75977 15.5273Z"/>
            </svg>
        {:else}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14"/>
            </svg>
        {/if}
    {/if}
    <input class:search autocomplete="off" spellcheck="false" maxlength="40" type="search" placeholder="{isiOS ? hint : ''}" bind:value={inputValue}/>
    <div class="search-hint" class:search>{hint}</div>
</div>
<style>
    .search-bar {
        position: relative;
        width: 100%;
    }

    /*noinspection CssNonIntegerLengthInPixels*/
    input {
        width: 100%;
        padding-inline: 18px;
        padding-block: 14px;
        font-size: 16px;
        color: var(--tg-theme-text-color);
        border: 1.5px oklch(from var(--tg-theme-subtitle-text-color) l c h / 40%) solid;
        border-radius: 6px;
        caret-color: var(--tg-theme-accent-text-color);
        background: transparent;
        transition: 200ms cubic-bezier(0, 0, 0.2, 1);
    }

    input.search {
        padding-inline: 44px 18px;
    }

    input[type="search"]::-webkit-search-cancel-button {
        -webkit-appearance: none;
        appearance: none;
    }

    .search-bar.isiOS > input {
        border: none;
        border-radius: 50px;
        padding-inline: 16px;
        padding-block: 10px;
        caret-color: var(--tg-theme-accent-text-color);
        background: var(--tg-theme-section-bg-color);
    }

    .search-bar.isiOS > input.search {
        padding-inline: 42px 16px;
    }

    input::placeholder {
        font-size: 17px;
        color: color-mix(in srgb, var(--tg-theme-subtitle-text-color) 75%, transparent);
    }

    input:focus {
        border-color: var(--tg-theme-accent-text-color);
        outline: var(--tg-theme-accent-text-color);
    }

    .search-bar.isiOS > input:focus {
        outline: none;
    }

    /*noinspection CssUnusedSymbol*/
    .search-bar:not(.isiOS):has(input:focus) > svg {
        fill: var(--tg-theme-accent-text-color);
    }

    svg {
        width: 23px;
        height: 23px;
        position: absolute;
        top: 50%;
        left: 16px;
        transform: translateY(-50%);
        fill: color-mix(in srgb, var(--tg-theme-subtitle-text-color) 75%, transparent);
        transition: fill 200ms cubic-bezier(0, 0, 0.2, 1);
    }

    .search-bar.isiOS > svg {
        width: 16px;
        height: 16px;
    }

    .search-bar.isiOS > .search-hint {
        display: none;
    }

    /*noinspection CssUnusedSymbol*/
    .search-bar:not(.isiOS) > .search-hint {
        position: absolute;
        margin: 0;
        left: 18px;
        top: 50%;
        font-size: 17px;
        transform: translateY(-50%);
        color: var(--tg-theme-subtitle-text-color);
        background: var(--background-parent);
        padding-inline: 3px;
        pointer-events: none;
        transition: 150ms cubic-bezier(0, 0, 0.2, 1);
    }

    /*noinspection CssUnusedSymbol*/
    .search-bar:not(.isiOS) > .search-hint {
        left: 43px;
    }

    /*noinspection CssUnusedSymbol*/
    .search-bar:not(.isiOS):has(input:focus) > .search-hint {
        color: var(--tg-theme-accent-text-color);
    }

    /*noinspection CssUnusedSymbol*/
    .search-bar:not(.isiOS):has(input:focus) > .search-hint,
    .search-bar:not(.isiOS).has-input > .search-hint {
        top: 2%;
        left: 13px;
        font-size: 12px;
    }
</style>
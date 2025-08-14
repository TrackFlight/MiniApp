<script lang="ts">
    import {fly, type TransitionConfig} from 'svelte/transition';
    import {cubicInOut} from "svelte/easing";
    import {onDestroy, onMount} from "svelte";
    import {registerBottomSheet, unregisterBottomSheet} from "./BottomSheet";
    import {telegram} from "../lib/telegram";

    const {id,  children } : {id: string, children: any} = $props();

    let show = $state(false);
    let data: any = $state();

    function onClickOutside(event: MouseEvent) {
        if (event.target instanceof Element && !event.target.closest('.bottom-sheet > div')) {
            telegram.closeBottomSheet(id)
        }
    }

    function onKey(event: KeyboardEvent) {
        if ((event.key === "Enter" || event.key === " ")) {
            if (event.target instanceof Element && !event.target.closest('.bottom-sheet > div')) {
                event.preventDefault();
                show = false;
            }
        }
    }

    function backgroundFade(
        _: Element,
        { duration }: { duration: number }
    ): TransitionConfig {
        return {
            duration,
            easing: cubicInOut,
            css: (t: number): string => `background-color: rgba(0, 0, 0, ${t * 0.3});`
        };
    }

    onMount(() => {
        registerBottomSheet(id, (newData: any) => {
            show = true;
            data = newData;
        }, () => {
            show = false;
        });
    });

    onDestroy(() => {
        unregisterBottomSheet(id);
    })
</script>

{#if show}
    <div transition:backgroundFade={{duration: 250}} class="bottom-sheet" role="button" tabindex="0" onclick={onClickOutside} onkeydown={onKey}>
        <div transition:fly={{ y: "100%", duration: 250, easing: cubicInOut, opacity: 1 }}>
            {@render children(data)}
        </div>
    </div>
{/if}

<style>
    .bottom-sheet {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        background-color: rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: flex-end;
        justify-content: center;
        transition: background-color 150ms ease-in-out;
    }

    .bottom-sheet > div {
        width: 100%;
        max-width: 420px;
        border-radius: 12px 12px 0 0;
        overflow: hidden;
        background-color: var(--tg-theme-secondary-bg-color);
        padding-bottom: var(--tg-safe-area-inset-bottom);
    }
</style>
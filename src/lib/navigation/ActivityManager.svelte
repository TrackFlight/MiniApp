<script lang="ts">
    import type {TransitionConfig} from 'svelte/transition';
    import type {ComponentsMap} from './ActivityManager';
    import {initActivityManager} from './ActivityManager';
    import {onDestroy} from 'svelte';
    import {cubicInOut} from 'svelte/easing';
    import {ScrollCache} from "../scroll-cache";

    let {
        activities,
        initialActivity,
    }: {
        activities: ComponentsMap,
        initialActivity: keyof typeof activities
    } = $props();

    const { current, stack } = initActivityManager(initialActivity);

    let currentActivityElement: HTMLElement | undefined = $state();
    let currentState: any = $state();
    let prevStack: typeof stack = $state([]);
    let currentStack: typeof stack = $state([]);
    const scrollCache = new ScrollCache();

    const unsubscribe = current.subscribe(async (state) => {
        prevStack = currentStack;
        if (prevStack.length < stack.length && currentState) {
            scrollCache.save(currentState!.name, currentActivityElement)
        } else if (prevStack.length > stack.length && currentState) {
            scrollCache.delete(currentState!.name);
        }
        currentStack = [...stack];
        currentState = state;
    });

    onDestroy(unsubscribe);

    $effect(() => {
        if (!currentActivityElement || !currentState) return;
        const observer = new MutationObserver(() => {
            scrollCache.restore(currentState!.name, currentActivityElement);
            observer.disconnect();
        });
        observer.observe(currentActivityElement, { childList: true, subtree: true });
    });

    const CurrentActivity = $derived(currentState ? activities[currentState.name] : null);
    let goingBack = $derived(prevStack.length > currentStack.length);

    function flyBackIn(
        _: Element,
        { duration }: { duration: number }
    ): TransitionConfig {
        return {
            duration,
            easing: cubicInOut,
            css: (t: number): string => `transform: translate3d(${goingBack ? -30 * (1 - t) : 100 * (1 - t)}%, 0, 0);z-index: ${goingBack ? 0:1};`
        };
    }

    function flyBackOut(
        _: Element,
        { duration }: { duration: number }
    ): TransitionConfig {
        return {
            duration,
            easing: cubicInOut,
            css: (t: number): string => `transform: translate3d(${goingBack ? 100 * (1 - t) : -30 * (1 - t)}%, 0, 0);z-index: ${goingBack ? 1:0};`
        };
    }
</script>


<div class="viewport">
    {#if currentState}
        {#key currentState.id}
            <div class="activity" in:flyBackIn={{duration: 300}} out:flyBackOut={{duration: 300}} bind:this={currentActivityElement}>
                <CurrentActivity
                    {...currentState.props}
                />
            </div>
        {/key}
    {/if}
</div>

<style>
    .viewport {
        position: relative;
        overflow: hidden;
        width:100%;
        height:100%;
    }

    .activity {
        position:absolute;
        width:100%;
        height:100%;
        display: flex;
        flex-direction: column;
        background: var(--tg-theme-secondary-bg-color);
    }
</style>
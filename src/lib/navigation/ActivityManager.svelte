<script lang="ts">
    import type {TransitionConfig} from 'svelte/transition';
    import type {ComponentsMap} from './ActivityManager';
    import {initActivityManager} from './ActivityManager';
    import {onDestroy} from 'svelte';
    import {cubicOut} from 'svelte/easing';

    let {
        activities,
        initialActivity,
    }: {
        activities: ComponentsMap,
        initialActivity: keyof typeof activities
    } = $props();

    const { current, stack, getDomPath } = initActivityManager(initialActivity);

    let currentActivityElement: HTMLElement | undefined = $state();
    let currentState: any = $state();
    let prevStack: typeof stack = $state([]);
    let currentStack: typeof stack = $state([]);
    const scrollCache = new Map<string, { top: number, left: number }>();

    const unsubscribe = current.subscribe(async (state) => {
        prevStack = currentStack;
        if (prevStack.length < stack.length && currentState) {
            saveScroll(currentState!.name);
        } else if (prevStack.length > stack.length && currentState) {
            for (const [key] of scrollCache.entries()) {
                if (key.startsWith(`${currentState.name}:`)) {
                    scrollCache.delete(key);
                }
            }
        }
        currentStack = [...stack];
        currentState = state;
    });

    onDestroy(unsubscribe);

    $effect(() => {
        if (!currentActivityElement || !currentState) return;
        const observer = new MutationObserver(() => {
            restoreScroll(currentState!.name);
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
            easing: cubicOut,
            css: (t: number): string => `transform: translateX(${goingBack ? -30 * (1 - t) : 100 * (1 - t)}%);z-index: ${goingBack ? 0:1};`
        };
    }

    function flyBackOut(
        _: Element,
        { duration }: { duration: number }
    ): TransitionConfig {
        return {
            duration,
            easing: cubicOut,
            css: (t: number): string => `transform: translateX(${goingBack ? 100 * (1 - t) : -30 * (1 - t)}%);z-index: ${goingBack ? 1:0};`
        };
    }

    function isScrollable(el: Element): boolean {
        const style = getComputedStyle(el);
        return (
            (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
            el.scrollHeight > el.clientHeight
        ) || (
            (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
            el.scrollWidth > el.clientWidth
        );
    }

    function saveScroll(activityId: string) {
        if (!currentActivityElement) return;
        const elements = currentActivityElement!.querySelectorAll('*');
        for (const el of elements) {
            if (isScrollable(el)) {
                const key = `${activityId}:${getDomPath(el)}`;
                scrollCache.set(key, {
                    top: (el as HTMLElement).scrollTop,
                    left: (el as HTMLElement).scrollLeft,
                });
            }
        }
    }

    function restoreScroll(activityId: string) {
        if (!currentActivityElement) return;
        const elements = currentActivityElement!.querySelectorAll('*');
        for (const el of elements) {
            const key = `${activityId}:${getDomPath(el)}`;
            const saved = scrollCache.get(key);
            if (saved) {
                if (el instanceof HTMLElement) {
                    el.scrollTop = saved.top;
                    el.scrollLeft = saved.left;
                }
            }
        }
    }
</script>


<div class="viewport">
    {#if currentState}
        {#key currentState.id}
            <div class="activity" in:flyBackIn={{duration: 350}} out:flyBackOut={{duration: 350}} bind:this={currentActivityElement}>
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
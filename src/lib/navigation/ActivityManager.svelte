<script lang="ts">
    import type { ComponentsMap } from './ActivityManager';
    import { initActivityManager } from './ActivityManager';
    import {onDestroy} from "svelte";
    import {Tween} from "svelte/motion";
    import {cubicInOut} from "svelte/easing";

    let {
        activities,
        initialActivity,
    }: {
        activities: ComponentsMap,
        initialActivity: keyof typeof activities
    } = $props();

    const { current, stack } = initActivityManager(initialActivity);

    let currentState: any = $state();
    let currentStack: any[] = $state([]);
    const transition = new Tween(1, {
        duration: 275,
        easing: cubicInOut
    });


    const unsubscribe = current.subscribe(async (state) => {
        let oldStack = currentStack;
        if (oldStack.length > stack.length) {
            await transition.set(stack.length);
        }
        currentState = state;
        currentStack = [...stack];

        if (oldStack.length <= stack.length) {
            await transition.set(stack.length);
        }
    });

    onDestroy(unsubscribe);

    function getTransform(i: number): string {
        const delta = i + 1 - transition.current;
        if (delta < 0) {
            return `translateX(${delta * 20}px)`;
        } else if (delta === 0) {
            return 'translateX(0)';
        } else {
            return `translateX(${100 * delta}%)`;
        }
    }
</script>


<div class="viewport">
    {#each currentStack as entry, i (entry.name)}
        {@const Activity = activities[entry.name]}
        <div class="activity" style="z-index: {i};transform: {getTransform(i)};pointer-events: {i + 1 === Math.round(transition.current) ? 'auto' : 'none'};">
            <Activity
                {...currentState.props}
            />
        </div>
    {/each}
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
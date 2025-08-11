<script lang="ts">
    import {getApplicationContext} from "../lib/navigation/ActivityManager";
    import {onMount} from "svelte";

    let {
        fragments = [],
    }: {
        fragments?: any[],
    } = $props();

    const {getComponentContext} =  getApplicationContext();

    let currentPage: number = $state(0);
    let prevPage: number = $state(1);
    let goingBack = $derived(prevPage > currentPage);

    let visiblePages = $state(new Set<number>([0]));
    let visiblePagesTimeout: ReturnType<typeof setTimeout>;
    let viewPagerEl: HTMLElement;
    let disableAnimation = $state(false);

    onMount(async () => {
        const {onCapture, onRestore} = getComponentContext(viewPagerEl);

        onCapture(() => {
            return {
                currentPage,
                prevPage,
            };
        });

        onRestore((state: { currentPage: number, prevPage: number }) => {
            disableAnimation = true;
            currentPage = state.currentPage;
            prevPage = state.prevPage;
            visiblePages = new Set([currentPage]);
        });
    });

    export function setCurrentPage(page: number): void {
        disableAnimation = false;
        if (page < 0 || page >= fragments.length) return;
        if (currentPage === page) return;
        prevPage = currentPage;
        currentPage = page;

        visiblePages.add(page);
        visiblePages.add(prevPage);
        visiblePages = new Set(visiblePages);
        clearInterval(visiblePagesTimeout);
        visiblePagesTimeout = setTimeout(() => {
            visiblePages.delete(prevPage);
            visiblePages = new Set(visiblePages);
        }, 250);
    }

    export function getCurrentPage(): number {
        return currentPage;
    }
</script>

<div class="viewport" bind:this={viewPagerEl}>
    {#each fragments as Fragment, index (index)}
        <div
            class="fragment"
            class:disableAnimation
            style="visibility: {visiblePages.has(index) ? 'visible':'hidden'};transform: translate3d({index === currentPage ? 0:(goingBack ? 100 : -100)}%, 0, 0);"
        >
            <Fragment/>
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

    .fragment {
        background: var(--tg-theme-secondary-bg-color);
        position:absolute;
        width:100%;
        height:100%;
        transition: transform 250ms cubic-bezier(0.65, 0, 0.35, 1);
    }

    .fragment.disableAnimation {
        transition: none;
    }
</style>
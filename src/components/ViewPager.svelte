<script lang="ts">
    let {
        fragments = [],
    }: {
        fragments?: any[],
    } = $props();

    let currentPage: number = $state(0);
    let prevPage: number = $state(1);
    let goingBack = $derived(prevPage > currentPage);

    let visiblePages = $state(new Set<number>([0]));
    let visiblePagesTimeout: ReturnType<typeof setTimeout>;

    export function setCurrentPage(page: number): void {
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

<div class="viewport">
    {#each fragments as Fragment, index (index)}
        <div
            class="fragment"
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
</style>
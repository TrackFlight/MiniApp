<script lang="ts">
    import {onDestroy, onMount, tick} from "svelte";

    const { data = $bindable(), children } : {data: any, children: any} = $props();

    let viewport: HTMLElement;
    let averageHeight = $state(0);
    let currentTop = $state(0);
    let clientHeight = $state(0);
    let parentElement: HTMLElement | null = $state(null);
    let totalHeight = $derived(data.length * averageHeight);
    let visibleItems = $derived(Math.ceil((clientHeight - currentTop) / averageHeight));

    let indexedData = $derived(data.map((item: any, i: Number) => ({ __vid: i, ...item })));
    let start = $derived(Math.max(0, Math.floor(-currentTop / averageHeight) - 5));
    let end = $derived(isNaN(visibleItems) ? 1 : Math.min(visibleItems + 5, data.length));
    let visible = $derived(indexedData.slice(start, end));

    onMount(async () => {
        await tick();
        averageHeight = viewport.children[0].getBoundingClientRect().height;
        await tick();
        parentElement = viewport.parentElement;
        while (parentElement && parentElement !== document.body) {
            if (parentElement.scrollHeight > parentElement.clientHeight) {
                parentElement.addEventListener('scroll', onScroll);
                break;
            }
            parentElement = parentElement.parentElement;
        }
        clientHeight = parentElement!.clientHeight;
        currentTop = viewport.getBoundingClientRect().top;
    });

    onDestroy(() => {
        if (parentElement) parentElement.removeEventListener("scroll", onScroll);
    });

    function onScroll() {
        currentTop = viewport.getBoundingClientRect().top;
    }
</script>

<div bind:this={viewport} style="height: {totalHeight}px; overflow-anchor: none; flex: 0 0 auto; visibility: hidden; width: 100%; position: relative;">
    {#each visible as item, index (item.id ?? item.__vid)}
        <div style="position: absolute; top: {(averageHeight * (start + index))}px; width: 100%;visibility: visible">
            {@render children(item)}
        </div>
    {/each}
</div>
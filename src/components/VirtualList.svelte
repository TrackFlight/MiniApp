<script lang="ts">
    import {onDestroy, onMount, tick} from "svelte";

    const { data = $bindable(), children } : {data: any, children: any} = $props();

    let viewport: HTMLElement;
    let currentTop = $state(0);
    let clientHeight = $state(0);
    let averageHeight = $state(0);
    let parentElement: HTMLElement;
    let totalHeight = $derived(data.length * averageHeight);
    let visibleItems = $derived(Math.ceil((clientHeight - currentTop) / averageHeight));

    let indexedData = $derived(data.map((item: any, i: number) => (item.hasOwnProperty('__vid') ? item : { __vid: item.hasOwnProperty('id') ? item.id : i, ...item })));
    let start = $derived(Math.max(0, Math.floor(-currentTop / averageHeight) - 3));
    let end = $derived(Math.max(1, isNaN(visibleItems) ? 1 : visibleItems + 3));
    let visible = $derived(indexedData.slice(start, end));

    let resizeObserver: ResizeObserver;
    let resizeObserverElement: ResizeObserver;
    let ready = $state(false);

    onMount(async () => {
        resizeObserver = new ResizeObserver(() => {
            parentElement = viewport.parentElement!;
            while (parentElement && parentElement !== document.body) {
                if (parentElement.scrollHeight > parentElement.clientHeight) {
                    parentElement.addEventListener('scroll', onScroll);
                    break
                }
                parentElement = parentElement.parentElement!;
            }
            clientHeight = parentElement!.clientHeight;
            currentTop = viewport.getBoundingClientRect().top;
            resizeObserver?.disconnect();
            ready = true;
            resizeObserverElement = new ResizeObserver(() => {
                clientHeight = parentElement!.clientHeight;
                currentTop = viewport.getBoundingClientRect().top;
            });
            resizeObserverElement.observe(parentElement!);
        });
        resizeObserver.observe(viewport!);
    });

    onDestroy(() => {
        if (parentElement) parentElement.removeEventListener("scroll", onScroll);
        resizeObserver?.disconnect();
        resizeObserverElement?.disconnect();
    });

    $effect(() => {
        if (data.length > 0 && averageHeight === 0) {
            tick().then(() => {
                averageHeight = viewport.children[0].getBoundingClientRect().height;
            })
        }
    });

    function onScroll() {
        currentTop = viewport.getBoundingClientRect().top;
    }
</script>

<div class="virtual-list" bind:this={viewport} style="height: {totalHeight}px;" class:ready>
    {#each visible as item, index (item.__vid)}
        <div style="top: {averageHeight * (start + index)}px;">
            {@render children(item)}
        </div>
    {/each}
</div>

<style>
    .virtual-list {
        overflow-anchor: none;
        flex: 0 0 auto;
        visibility: hidden;
        width: 100%;
        position: relative;
    }

    .virtual-list.ready {
        transition: height 250ms cubic-bezier(0.55, 0, 0.1, 1);
    }

    .virtual-list.ready > div {
        transition: top 250ms cubic-bezier(0.55, 0, 0.1, 1);
    }

    .virtual-list > div {
        position: absolute;
        width: 100%;
        visibility: visible;
    }
</style>
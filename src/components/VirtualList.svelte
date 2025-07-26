<script lang="ts">
    import {onDestroy, onMount, tick} from "svelte";
    import ItemWrapper from "./ItemWrapper.svelte";
    import {Tween} from "svelte/motion";
    import {cubicOut} from "svelte/easing";

    const { data = $bindable(), children } : {data: any, children: any} = $props();

    let viewport: HTMLElement;
    let wasEmpty = data.length === 0;
    let currentTop = $state(0);
    let clientHeight = $state(0);
    let averageHeight = $state(0);
    let parentElement: HTMLElement;
    let totalHeight = $derived(data.length * averageHeight);
    let totalHeightTween: Tween<number> | undefined = $state();
    let visibleItems = $derived(Math.ceil((clientHeight - currentTop) / averageHeight));

    let indexedData = $derived(data.map((item: any, i: number) => (item.hasOwnProperty('__vid') ? item : { __vid: i, ...item })));
    let start = $derived(Math.max(0, Math.floor(-currentTop / averageHeight) - 3));
    let end = $derived(Math.max(1, isNaN(visibleItems) ? 1 : visibleItems + 3));
    let visible = $derived(indexedData.slice(start, end));

    onMount(async () => {
        await tick();
        await tick();
        parentElement = viewport.parentElement!;
        while (parentElement && parentElement !== document.body) {
            if (parentElement.scrollHeight > parentElement.clientHeight) {
                parentElement.addEventListener('scroll', onScroll);
                break
            }
            parentElement = parentElement.parentElement!;
        }
        clientHeight = parentElement!.parentElement!.clientHeight
        currentTop = viewport.getBoundingClientRect().top;
    });

    onDestroy(() => {
        if (parentElement) parentElement.removeEventListener("scroll", onScroll);
    });

    $effect(() => {
        if (data.length > 0 && averageHeight === 0) {
            tick().then(() => {
                averageHeight = viewport.children[0].getBoundingClientRect().height;
                totalHeightTween = new Tween(wasEmpty ? 0:totalHeight, {
                    duration: 250,
                    easing: cubicOut
                });
                wasEmpty = false;
            })
        } else {
            totalHeightTween?.set(totalHeight);
        }
    });

    function onScroll() {
        currentTop = viewport.getBoundingClientRect().top;
    }
</script>

<div bind:this={viewport} style="height: {totalHeightTween?.current}px; overflow-anchor: none; flex: 0 0 auto; visibility: hidden; width: 100%; position: relative;">
    {#each visible as item, index (item.__vid)}
        <ItemWrapper top={averageHeight * (start + index)}>
            {@render children(item)}
        </ItemWrapper>
    {/each}
</div>
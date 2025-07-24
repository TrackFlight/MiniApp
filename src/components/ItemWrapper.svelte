<script lang="ts">
    import { Tween } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    const { top = $bindable(), children } : {top: number, children: any} = $props();

    let topTween = new Tween(top, {
        duration: 250,
        easing: cubicOut
    });
    $effect(() => {
        topTween.set(top);
    });
</script>

<div style="position: absolute; top: {topTween.current}px; width: 100%; visibility: visible;">
    {@render children?.()}
</div>
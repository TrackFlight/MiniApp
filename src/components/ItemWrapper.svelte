<script lang="ts">
    const { top = $bindable(), children } : {top: number, children: any} = $props();
</script>

<div class="item-wrapper" style="top: {top}px;">
    {@render children?.()}
</div>

<style>
    .item-wrapper {
        position: absolute;
        transition: top 225ms cubic-bezier(0.55, 0, 0.1, 1);
        width: 100%;
        visibility: visible;
    }
</style>
<script lang="ts">
    const {children} : {children: any} = $props();
</script>

<div class="content">
    {@render children?.()}
</div>

<style>
    .content {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow-y: auto;
    }

    .content::-webkit-scrollbar {
        display: none;
    }
</style>
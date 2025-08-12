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
        padding-bottom: 10px;
    }

    .content::-webkit-scrollbar {
        display: none;
    }
</style>
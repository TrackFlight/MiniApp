<script lang="ts">
    const {children} : {children: any} = $props();
</script>

<div class="content">
    {@render children?.()}
</div>

<style>
    .content {
        height: 100%;
        overflow-y: auto;
        padding-bottom: 10px;
    }

    .content::-webkit-scrollbar {
        display: none;
    }
</style>
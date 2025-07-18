<script lang="ts">
    import {fade} from 'svelte/transition';
    import LoadingProgress from "./LoadingProgress.svelte";
</script>

<div class="progress-bar" transition:fade={{ duration: 250 }}>
    <div>
        <LoadingProgress/>
    </div>
</div>

<style>
    .progress-bar {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.5);
        width: 100%;
        height: 100%;
    }

    .progress-bar > div {
        width: 95px;
        height: 95px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 25px;
        background: color-mix(in srgb, var(--tg-theme-secondary-bg-color) 55%, transparent);
        backdrop-filter: var(--global-backdrop-filter);
        -webkit-backdrop-filter: saturate(180%) blur(20px);
    }
</style>
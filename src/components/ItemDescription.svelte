<script lang="ts">
    import {isiOS} from "../lib/telegram";

    const { description } : {description: string} = $props();
</script>

<p class:isiOS>
    {description}
</p>

<style>
    p {
        color: var(--tg-theme-subtitle-text-color);
        margin-inline: 22px;
        margin-top: 15px;
        font-size: 14px;
    }

    p.isiOS {
        padding-inline: 14px;
        color: var(--tg-theme-section-header-text-color);
    }
</style>
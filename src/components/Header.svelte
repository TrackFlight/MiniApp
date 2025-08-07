<script lang="ts">
    import {isiOS} from "../lib/telegram";
</script>
<div class="header" class:isiOS>
    <slot/>
</div>

<style>
    .header {
        padding-block-start: 14px;
        padding-inline: 14px;
        width: 100%;
        display: flex;
        align-items: center;
        flex-direction: row-reverse;
        justify-content: space-between;
    }

    .header:not(.isiOS) {
        background: var(--tg-theme-section-bg-color);
    }
</style>
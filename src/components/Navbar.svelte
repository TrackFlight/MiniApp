<script lang="ts">
    import {isiOS} from "../lib/telegram";
</script>

<div class="navbar" class:isiOS>

</div>

<style>
    .navbar {
        height: 60px;
        width: 100%;
        background: var(--tg-theme-bottom-bar-bg-color);
        border-top: 1px solid var(--tg-theme-section-separator-color);
    }

    .navbar:not(.isiOS) {
        background: var(--tg-theme-section-bg-color);
    }
</style>
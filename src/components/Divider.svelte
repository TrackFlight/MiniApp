<script lang="ts">
    import {isiOS} from "../lib/telegram";
</script>

{#if !isiOS}
    <div style="height: 15px;flex-shrink: 0;"></div>
{/if}
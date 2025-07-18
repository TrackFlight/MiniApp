<script lang="ts">
    import {isiOS} from "../lib/telegram";
</script>

{#if !isiOS}
    <div style="height: 15px;"></div>
{/if}
<!--suppress CssUnusedSymbol -->
<script lang="ts">
    import type {WebAppUser} from "../lib/telegram";

    const { user } : {user: WebAppUser} = $props();
</script>

<div class="user-icon">
    <img src="{user.photo_url}" alt="User" loading="lazy"/>
</div>

<style>
    .user-icon {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: opacity 120ms ease-out;
    }

    .user-icon > img {
        width: 100%;
        height: 100%;
    }
</style>
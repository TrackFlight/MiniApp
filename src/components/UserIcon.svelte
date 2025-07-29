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
        width: 36px;
        height: 36px;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .user-icon > img {
        width: 100%;
        height: 100%;
    }
</style>
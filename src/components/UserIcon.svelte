<!--suppress CssUnusedSymbol -->
<script lang="ts">
    import type {WebAppUser} from "../lib/telegram";

    const { user } : {user: WebAppUser} = $props();

    const colors = ['red', 'orange', 'purple', 'green', 'cyan', 'blue', 'pink'];
    const colorName = colors[user.id % colors.length];

    const initials = () => {
        let builtName = user.first_name;
        if (user.last_name) {
            builtName += " " + user.last_name;
        }
        return builtName.match(/\p{L}+/gu)
            ?.map(word => word[0])
            .join('') ?? '';
    };
</script>

<div class="user-icon {colorName}">
    {#if user.photo_url}
        <img src="{user.photo_url}" alt="User" />
    {:else}
        <p>{initials()}</p>
    {/if}
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

    .user-icon > p {
        margin: 0;
        font-size: 15px;
        color: white;
        font-family: 'SFRounded-Bold', serif;
    }

    /** Color gradients for user icons */
    .user-icon.red {
        background: linear-gradient(#FF885E, #FF516A);
    }

    .user-icon.orange {
        background: linear-gradient(#FFCD6A, #FFA85C);
    }

    .user-icon.purple {
        background: linear-gradient(#82B1FF, #665FFF);
    }

    .user-icon.green {
        background: linear-gradient(#A0DE7E, #54CB68);
    }

    .user-icon.cyan {
        background: linear-gradient(#53EDD6, #28C9B7);
    }

    .user-icon.blue {
        background: linear-gradient(#72D5FD, #2A9EF1);
    }

    .user-icon.pink {
        background: linear-gradient(#E0A2F3, #D669ED);
    }
</style>
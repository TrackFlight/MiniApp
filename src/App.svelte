<script lang="ts">
    import {telegram, type BulletinButton} from "./lib/telegram";
    import { fade } from 'svelte/transition';
    import Home from "./pages/Home.svelte";
    import Navbar from "./components/Navbar.svelte";
    import { tryLogin } from "./lib/api";
    import LoadingDialog from "./components/LoadingDialog.svelte";
    import Bulletin from "./components/Bulletin.svelte";
    import { bulletinState } from "./lib/stores";

    telegram?.ready();

    telegram.showLoadingProgress = (show: boolean) => loading = show;
    telegram.showPrompt = (text: string, callback: (result: string | null) => void) => callback(prompt(text));
    telegram.showBulletin = (icon: string, text: string, duration?: number, title?: string, button?: BulletinButton, on_close?: () => void) => {
        bulletinState.update((current) => {
            const isSame = current?.text === text && current?.icon === icon && current?.title === title && current?.icon !== 'timer';
            return {
                title: title,
                text: text,
                icon: icon,
                duration: duration || 1800,
                button: button,
                on_close: on_close,
                shake: isSame,
                reopen: bulletinEl != undefined && !isSame,
            };
        });
        bulletin = true;
    };

    let bulletin = $state(false);
    let logged = $state(false);
    let loading = $state(false);
    let bulletinEl: Bulletin | undefined = $state();

    tryLogin().then((success: boolean) => {
        if (success) {
            telegram?.setHeaderColor("secondary_bg_color");
            telegram?.setBackgroundColor("secondary_bg_color");
            logged = true;
            return;
        }
        telegram?.showPopup({
            title: "Authentication Failed",
            message: "Please try again later.",
            buttons: [{type: "ok"}]
        }, () => {
            telegram?.close();
        });
    });
</script>

{#if logged}
    <main transition:fade={{ duration: 250 }}>
        <div class="content">
            <div>
                <Home/>
            </div>
            {#if bulletin}
                <Bulletin bind:this={bulletinEl} on_close={() => bulletin = false}/>
            {/if}
        </div>
        <Navbar/>
        {#if loading}
            <LoadingDialog/>
        {/if}
    </main>
{/if}

<style>
    .content {
        flex: 1;
        overflow: hidden;
        position: relative;
    }

    .content > div {
        height: 100%;
        overflow-y: auto;
        padding-bottom: 10px;
    }

    .content > div::-webkit-scrollbar {
        display: none;
    }

    main {
        height: 100vh;
        display: flex;
        flex-direction: column;
        background: var(--tg-theme-secondary-bg-color);
    }
</style>
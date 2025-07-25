<script lang="ts">
    import {telegram} from "./lib/telegram";
    import {fade} from 'svelte/transition';
    import Home from "./pages/Home.svelte";
    import Navbar from "./components/Navbar.svelte";
    import {tryLogin} from "./lib/api";
    import LoadingDialog from "./components/LoadingDialog.svelte";
    import Bulletin from "./components/Bulletin.svelte";

    telegram?.ready();
    telegram?.setHeaderColor("secondary_bg_color");
    telegram?.setBackgroundColor("secondary_bg_color");
    telegram.showLoadingProgress = (show: boolean) => loading = show;
    telegram.showPrompt = (text: string, callback: (result: string | null) => void) => callback(prompt(text));

    let logged = $state(false);
    let loading = $state(false);

    tryLogin().then((success: boolean) => {
        if (success) {
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
    <main transition:fade={{ duration: 450 }}>
        <div class="content">
            <div>
                <Home/>
            </div>
            <Bulletin/>
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
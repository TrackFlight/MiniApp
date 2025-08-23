<script lang="ts">
    import {isDesktop, isiOS, telegram} from "./lib/telegram";
    import {fade} from 'svelte/transition';
    import {tryLogin} from "./lib/api";
    import LoadingDialog from "./components/LoadingDialog.svelte";
    import MainActivity from "./activities/MainActivity.svelte";
    import ActivityManager from "./lib/navigation/ActivityManager.svelte";
    import AppInfoActivity from "./activities/AppInfoActivity.svelte";

    telegram?.ready();
    telegram?.expand();
    telegram?.setHeaderColor(isDesktop && !isiOS ? "bg_color" : "secondary_bg_color");
    telegram?.setBackgroundColor(isDesktop && !isiOS ? "bg_color" : "secondary_bg_color");
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

    const activities = {
        main: MainActivity,
        appInfo: AppInfoActivity,
    };
</script>

{#if logged}
    <main transition:fade={{ duration: 450 }}>
        <ActivityManager {activities} initialActivity="main"/>
        {#if loading}
            <LoadingDialog/>
        {/if}
    </main>
{/if}

<style>
    main {
        height: 100vh;
        display: flex;
        flex-direction: column;
        background: var(--tg-theme-secondary-bg-color);
    }
</style>
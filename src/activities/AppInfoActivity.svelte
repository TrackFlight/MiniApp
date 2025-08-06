<script lang="ts">
    import {
        type App,
        type Link,
        notifyAppListChanged, onAppListChanged,
        removeLink, sessionStore,
        withUIProgress
    } from "../lib/api";
    import {isiOS, telegram} from "../lib/telegram";
    import {GetLinkDescription, T} from "../lib/translator";
    import NamedIcon from "../components/NamedIcon.svelte";
    import Divider from "../components/Divider.svelte";
    import ListView from "../components/ListView.svelte";
    import VirtualList from "../components/VirtualList.svelte";
    import ItemView from "../components/ItemView.svelte";
    import {onMount, tick} from "svelte";
    import Bulletin from "../components/Bulletin.svelte";
    import {getApplicationContext} from "../lib/navigation/ActivityManager";
    import AppInfoBottomSheet from "../components/AppInfoBottomSheet.svelte";

    let {app} : { app: App } = $props();
    let showMore = $state(true);
    let moreTextSize = $state(0);
    let linksList = $state<Link[]>(app.links);
    let description: HTMLParagraphElement | undefined = $state();
    let moreButton: HTMLParagraphElement | undefined = $state();

    const {finishActivity} =  getApplicationContext();

    onAppListChanged(() => {
        const appInfo = sessionStore.appList.find(a => a.id === app.id);
        if (appInfo) {
            linksList = sessionStore.appList.find(a => a.id === app.id)!.links;
        }
    });

    onMount(async () => {
        await tick();
        await tick();
        if (description && description.scrollHeight == description.clientHeight) {
            showMore = false;
        }
        moreTextSize = moreButton?.clientWidth || 0;
    });

    function expandDescription() {
        showMore = false;
    }

    function onKey(e: KeyboardEvent) {
        if ((e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            expandDescription();
        }
    }

    function removeItem(link: Link) {
        telegram.showPopup(
            {
                title: T('REMOVE_LINK_CONFIRM_TITLE'),
                message: T('REMOVE_LINK_CONFIRM_DESC'),
                buttons: [
                    {
                        id: "delete",
                        text: T('REMOVE_BTN'),
                        type: "destructive",
                    },
                    {
                        type: "cancel",
                    }
                ]
            },
            async (result: string) => {
                if (result !== "delete") return;
                telegram.showBulletin(
                    "timer",
                     T('LINK_REMOVED'),
                    5000,
                    undefined,
                    {
                        text: T('UNDO_BTN'),
                        isUndo: true,
                        on_click: () => {
                            linksList = app.links;
                        }
                    },
                    async () => {
                        await withUIProgress(removeLink(link));
                        if (linksList.length === 0) {
                            finishActivity();
                        }
                        notifyAppListChanged();
                    },
                );
                linksList = linksList.filter(item => item.id !== link.id);
            },
        );
    }
</script>

<div class="content">
    <div class="app-header" class:isiOS>
        {#if app.icon_url}
            <img src={app.icon_url} alt="App Icon"/>
        {:else}
            <NamedIcon name={app.name ? app.name : T('UNKNOWN_APP')} id={app.links[0].id} size="{isiOS ? 120:55}px"/>
        {/if}
        <div>
            <h1>{app.name ? app.name : T('UNKNOWN_APP')}</h1>
            <p>{T('APP_FOLLOWERS_AMOUNT', {Amount: app.followers}, app.followers)}</p>
        </div>
    </div>
    <Divider/>
    {#if app.description}
        <div class="description-container" class:isiOS role="button" tabindex="0" class:showMore onclick={expandDescription} onkeydown={onKey}>
            <h4>{isiOS ? T('APP_DESCRIPTION_HEADER').toLowerCase() : T('APP_DESCRIPTION_HEADER')}</h4>
            <p class="more-button" bind:this={moreButton}>
                {T('DESCRIPTION_MORE_BUTTON')}
            </p>
            <p class="description" style="--text-size: {moreTextSize}px" bind:this={description}>{@html app.description.replaceAll("\n", "<br/>")}</p>
        </div>
        <Divider/>
    {/if}
    <ListView header={T('LINKS_HEADER')}>
        <!--suppress JSUnusedGlobalSymbols -->
        <VirtualList data={linksList}>
            {#snippet children(item: Link)}
                <ItemView
                    title={item.is_public ? item.url : item.url.replace(/\/(\w+)$/, '/<spoiler>$1</spoiler>')}
                    icon={item.status ? 'link' : 'link_loading'}
                    desc={GetLinkDescription(item)}
                    highlight={item.status === 'available'}
                    on_click={() => telegram.showBottomSheet('link-info', item)}
                    on_delete={() => removeItem(item)}
                    small
                />
            {/snippet}
        </VirtualList>
    </ListView>
</div>
<Bulletin/>
<AppInfoBottomSheet on_remove={removeItem}/>

<style>
    .content {
        height: 100%;
        overflow-y: auto;
        padding-bottom: 10px;
    }

    .content::-webkit-scrollbar {
        display: none;
    }

    .app-header {
        display: flex;
        align-items: center;
        width: 100%;
        padding-block: 13px;
        padding-inline: 17px;
        position: relative;
    }

    .app-header:not(.isiOS) {
        background: var(--tg-theme-section-bg-color);
    }

    .app-header.isiOS {
        padding-block: 50px 20px;
        flex-direction: column;
    }

    .app-header > img {
        width: 55px;
        height: 55px;
        border-radius: 50%;
    }

    .app-header.isiOS > img {
        width: 120px;
        height: 120px;
    }

    .app-header > div {
        display: flex;
        flex-direction: column;
    }

    .app-header:not(.isiOS) > div {
        margin-left: 17px;
    }

    .app-header.isiOS > div {
        align-items: center;
    }

    .app-header > div > h1 {
        color: var(--tg-theme-text-color);
        margin: 0;
        font-size: 18px;
        font-weight: 500;
    }

    .app-header.isiOS > div > h1 {
        margin: 20px 0 0;
        font-size: 23px;
    }

    .app-header > div > p {
        color: var(--tg-theme-hint-color);
        margin: 3px 0 0;
        font-size: 14px;
    }

    .app-header.isiOS > div > p {
        margin: 5px 0 0;
        font-size: 16px;
    }

    .description-container {
        padding-block: 13px;
        width: 100%;
        position: relative;
        background: var(--tg-theme-section-bg-color);
    }

    .description-container:not(.isiOS) {
        padding: 17px 17px 14px;
    }

    .description-container.isiOS {
        width: calc(100% - 28px);
        padding-inline: 14px;
        border-radius: 10px;
        margin-inline: 14px;
        margin-bottom: 14px;
    }

    .description-container > h4 {
        margin: 0 0 8px;
        font-weight: 600;
        font-size: 15px;
        color: var(--tg-theme-section-header-text-color);
    }

    .description-container.isiOS > h4 {
        color: var(--tg-theme-text-color);
        font-weight: normal;
        font-size: 14px;
        margin: 0;
    }

    .description-container > .description {
        color: var(--tg-theme-text-color);
        max-height: 3000px;
        margin: 5px 0 0;
        font-size: 16px;
        line-height: 1.3;
        overflow: hidden;
        transition: max-height 1s cubic-bezier(0.55, 0, 0.1, 1);
    }

    .description-container > .more-button {
        position: absolute;
        z-index: 1;
        color: var(--tg-theme-accent-text-color);
        bottom: 15px;
        right: 17px;
        margin: 0;
        display: none;
    }

    .description-container.showMore > .more-button {
        display: block;
    }

    .description-container.showMore > .description {
        max-height: calc(1.3em * 3);
        mask-image:
            linear-gradient(to bottom, black, black),
            linear-gradient(to right, black, black),
            linear-gradient(to right, black, transparent 50%);
        mask-size:
            100% calc(100% - 1.3em),
            calc(100% - var(--text-size) - 30px) 100%,
            50px 1.3em;
        mask-position:
            0 0,
            0 0,
            calc(100% - var(--text-size) + 20px) bottom;
        mask-repeat: no-repeat;
    }
</style>
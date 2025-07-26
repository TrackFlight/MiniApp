<script lang="ts">
    import {currentUser, isiOS, telegram} from "../lib/telegram";
    import UserIcon from '../components/UserIcon.svelte'
    import Header from "../components/Header.svelte";
    import StickerContainer from "../components/StickerContainer.svelte";
    import ListView from "../components/ListView.svelte";
    import Divider from "../components/Divider.svelte";
    import Button from "../components/Button.svelte";
    import ItemView from "../components/ItemView.svelte";
    import {ReadableDateDifference, T} from "../lib/translator";
    import {removeApp, ServerErrorCode, sessionStore, trackLink, withUIProgress, type App, getAppID} from "../lib/api";
    import VirtualList from "../components/VirtualList.svelte";

    let deletable = $state(!isiOS);
    let items = $state(sessionStore.appList);

    function removeItem(app: App) {
        telegram.showPopup(
            {
                title: T('REMOVE_APP_CONFIRM_TITLE'),
                message: T('REMOVE_APP_CONFIRM_DESC'),
                buttons: [
                    {
                        id: "delete",
                        text: T('DELETE_BTN'),
                        type: "destructive",
                    },
                    {
                        type: "cancel",
                    }
                ]
            },
            async (result: string) => {
                if (result !== "delete") return;
                const isUnknownApp = app.name == null;
                telegram.showBulletin(
                    "timer",
                    isUnknownApp ? T('LINK_REMOVED') :
                    T(
                        'APP_REMOVED_DESC',
                        {
                            Amount: app.links.length,
                        },
                        app.links.length,
                    ),
                    5000,
                    isUnknownApp ? undefined :
                    T(
                        'APP_REMOVED_TITLE',
                        {
                            AppName: app.name!,
                        }
                    ),
                    {
                        text: T('UNDO_BTN'),
                        isUndo: true,
                        on_click: () => {
                            items = sessionStore.appList;
                        }
                    },
                    async () => {
                        await withUIProgress(removeApp(app));
                        if (sessionStore.appList.length === 0 && isiOS) {
                            deletable = false;
                        }
                    },
                );
                items = items.filter(item => getAppID(item) !== getAppID(app));
            },
        );
    }

    async function addLink() {
        await telegram.closeBulletin();
        deletable = isiOS ? false : deletable;
        telegram.showPrompt(T('ADD_LINK_PROMPT'), async (link: string | null) => {
            if (!link) return;
            let res = await withUIProgress(trackLink(link));
            if (res === ServerErrorCode.LinkAlreadyFollowing) {
                telegram.showBulletin("error", T('LINK_ALREADY_FOLLOWING'));
            } else if (res == ServerErrorCode.BadRequest) {
                telegram.showBulletin("error", T('INVALID_LINK_FORMAT'));
            } else {
                telegram.showBulletin("link_added", T('LINK_ADDED'));
                items = sessionStore.appList;
            }
        });
    }
</script>
<Header>
    <Button type="opaque"><UserIcon user={currentUser} /></Button>
    {#if isiOS && items.length > 0}
        <Button text={deletable ? T('DONE_BTN') : T('EDIT_BTN')} on_click={() => deletable = !deletable}/>
    {/if}
</Header>
<StickerContainer
    title={T('HOME_TITLE')}
    desc={T('HOME_DESC')}
    sticker="DuckHome"
>
    <svg fill="var(--tg-theme-text-color)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path fill-opacity="0.1" d="M214,512c-56,0-111,0-166,0-6,0-35,4-39,0,1,1,0-71,0-78,0-79,0-157,0-235,0-39-4-79,0-118,3-31,51-61,79-62,3,0,33,3,33,3,2-6-2-11,3-16,7-7,90,7,104,9,20,2,104,7,116,14,10,6,0,21,5,27,12,10,38-3,59,30,20,32-5,41,27,69,12,10,74,52,69,67-10,31-49,26-67,6-4-5-2-17-8-16-15,2-11,103-11,120,0,51,0,101,0,152,0,4,3,26,0,28-3,3-25,0-29,0-59,0-117,0-175,0z" />
    </svg>
</StickerContainer>
<Divider/>
<ListView header={T('LINKS_HEADER')}>
    <ItemView icon="add" title={T('TRACK_LINK_BTN')} on_click={addLink}/>
    <!--suppress JSUnusedGlobalSymbols -->
    <VirtualList data={[...items].map((item) => ({ __vid: getAppID(item), ...item }))}>
        {#snippet children(item: App)}
            <ItemView
                title={item.name ? item.name : T('UNKNOWN_APP')}
                desc={
                    item.name ?
                    T(
                        'LINK_AMOUNT',
                        {
                            Amount: item.links.length,
                        },
                        item.links.length,
                    )
                    + ' • ' +
                    T(
                        'LAST_UPDATE_TIME',
                        {
                            Time: ReadableDateDifference(
                                [...item.links].sort((a, b) => b.last_update - a.last_update)[0].last_update,
                                Math.floor(Date.now() / 1000),
                            ),
                        }
                    ) : item.links[0].url
                }
                icon={item.icon_url ? item.icon_url : 'link_loading'}
                bind:deletable
                on_delete={() => removeItem(item)}
            />
        {/snippet}
    </VirtualList>
</ListView>
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
    import {removeLink, ServerErrorCode, sessionStore, trackLink, withUIProgress, type Link} from "../lib/api";
    import VirtualList from "../components/VirtualList.svelte";

    let deletable = $state(!isiOS);
    let items = $state(sessionStore.linksList);

    function removeItem(id: number) {
        telegram.showPopup(
            {
                title: T('DELETE_LINK_CONFIRM_TITLE'),
                message: T('DELETE_LINK_CONFIRM_DESC'),
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
                telegram.showBulletin(
                    "timer",
                    T('LINK_REMOVED'),
                    5000,
                    undefined,
                    {
                        text: T('UNDO_BTN'),
                        isUndo: true,
                        on_click: () => {
                            items = sessionStore.linksList;
                        }
                    },
                    async () => {
                        await withUIProgress(removeLink(id));
                        if (sessionStore.linksList.length === 0 && isiOS) {
                            deletable = false;
                        }
                    },
                );
                items = items.filter(item => item.id !== id);
            },
        );
    }

    function addLink() {
        telegram.showPrompt(T('ADD_LINK_PROMPT'), async (link: string | null) => {
            if (!link) return;
            let res = await withUIProgress(trackLink(link));
            if (res === ServerErrorCode.LinkAlreadyFollowing) {
                telegram.showBulletin("error", T('LINK_ALREADY_FOLLOWING'));
            } else if (res == ServerErrorCode.BadRequest) {
                telegram.showBulletin("error", T('INVALID_LINK_FORMAT'));
            } else {
                telegram.showBulletin("link_added", T('LINK_ADDED'));
                items = sessionStore.linksList;
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
    <ItemView icon="add" title="Add Link" on_click={addLink}/>
    <!--suppress JSUnusedGlobalSymbols -->
    <VirtualList data={items}>
        {#snippet children(item: Link)}
            <ItemView
                title={item.app_name}
                desc={
                    item.status === 'available' ?
                    T('STATUS_AVAILABLE'): item.last_availability === 0 ?
                    T('STATUS_UNAVAILABLE') : T('STATUS_TIMED_AVAILABLE', {
                        Time: ReadableDateDifference(
                            item.last_availability,
                            Math.floor(Date.now() / 1000),
                        )
                    })
                }
                icon={item.icon_url}
                tag={item.tag}
                highlight={item.status === 'available'}
                bind:deletable
                on_delete={() => removeItem(item.id)}
            />
        {/snippet}
    </VirtualList>
</ListView>
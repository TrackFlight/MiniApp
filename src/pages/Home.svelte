<script lang="ts">
    import {currentUser, telegram} from "../lib/telegram";
    import UserIcon from '../components/UserIcon.svelte'
    import Header from "../components/Header.svelte";
    import StickerContainer from "../components/StickerContainer.svelte";
    import ListView from "../components/ListView.svelte";
    import Divider from "../components/Divider.svelte";
    import Button from "../components/Button.svelte";
    import ItemView from "../components/ItemView.svelte";
    import { isiOS } from "../lib/telegram";
    import {removeLink, ServerErrorCode, sessionStore, trackLink, withUIProgress} from "../lib/api";
    import { ReadableDateDifference, T } from "../lib/translator";
    import { slide } from 'svelte/transition';

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
            telegram.showLoadingProgress(true);
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
/>
<Divider/>
<ListView header={T('LINKS_HEADER')}>
    <ItemView icon="add" title="Add Link" on_click={addLink}/>
    {#each items as item (item.id)}
        <div in:slide={{ duration: 250 }} out:slide={{ duration: 250 }}>
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
        </div>
    {/each}
</ListView>
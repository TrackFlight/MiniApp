<script lang="ts">
    import BottomSheet from "./BottomSheet.svelte";
    import Divider from "./Divider.svelte";
    import {T} from "../lib/translator";
    import {isiOS, telegram} from "../lib/telegram";
    import ItemView from "./ItemView.svelte";
    import Button from "./Button.svelte";
    import {sessionStore} from "../lib/api";
    import {registerBottomSheet} from "./BottomSheet";

    let inputValue = $state('');
    let notifyAvailable: Boolean = $state(true);
    let notifyClosed: Boolean = $state(false);
    const isValidLink = $derived.by(() => {
        return /^https?:\/\/(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/.test(inputValue);
    })

    registerBottomSheet('add-link', () => {}, () => {
        inputValue = ''
        notifyAvailable = true;
        notifyClosed = false;
    });
</script>

<!--suppress JSUnusedGlobalSymbols -->
<BottomSheet id="add-link">
    {#snippet children(callable: (link: String, notify_available: Boolean, notify_closed: Boolean) => void)}
        {@const isLocked = sessionStore.appList.reduce(
            (acc, app) => acc + app.links.filter(
                link => link.notify_closed || link.notify_available
            ).length, 0
        ) >= sessionStore.maxFreeLinks}
        <div class="bottom-sheet-header" class:isiOS>
            <h4>{T('TRACK_LINK_BTN')}</h4>
        </div>
        <input placeholder={T('ADD_LINK_INPUT_PLACEHOLDER')} class:isiOS bind:value={inputValue}>
        <Divider/>
        <div class="bottom-sheet-footer" class:isiOS>
            <div class="list-view" class:isiOS>
                <ItemView
                    title={T('NOTIFICATION_SETTINGS_OPEN_TITLE')}
                    desc={isiOS ? '' : T('NOTIFICATION_SETTINGS_OPEN_DESC')}
                    icon={isiOS ? 'no_icon' : "available_icon"}
                    small={!isiOS}
                    no_ellipsis
                    switchable
                    switchDefault={true}
                    switchLocked={isLocked}
                    on_switch_change={(checked: Boolean) => notifyAvailable = checked}
                />
                <ItemView
                    title={T('NOTIFICATION_SETTINGS_CLOSED_TITLE')}
                    desc={isiOS ? '' : T('NOTIFICATION_SETTINGS_CLOSED_DESC')}
                    icon={isiOS ? 'no_icon' : "closed_icon"}
                    small={!isiOS}
                    no_ellipsis
                    switchable
                    switchLocked={isLocked}
                    on_switch_change={(checked: Boolean) => notifyClosed = checked}
                />
            </div>
            <Divider/>
            <div class="add-section" class:isiOS>
                <Button on_click={() => {
                    callable(inputValue, notifyAvailable, notifyClosed);
                    telegram.closeBottomSheet('add-link');
                }} text={T('TRACK_LINK_BTN')} accent="var(--tg-theme-button-color)" disabled={!isValidLink}/>
            </div>
        </div>
    {/snippet}
</BottomSheet>

<style>
    .bottom-sheet-header {
        display: flex;
        flex-direction: column;
        width: 100%;
        padding: 16px 22px;
    }

    .bottom-sheet-header:not(.isiOS) {
        background: var(--tg-theme-section-bg-color);
    }

    .bottom-sheet-header > h4 {
        margin: 0;
        font-size: 18px;
        font-weight: bold;
        color: var(--tg-theme-text-color);
    }

    input {
        background: var(--tg-theme-section-bg-color);
        border: none;
        font-size: 18px;
        color: var(--tg-theme-text-color);
        caret-color: var(--tg-theme-accent-text-color);
    }

    input.isiOS {
        width: calc(100% - 14px * 2);
        padding: 14px 16px;
        margin-inline: 14px;
        border-radius: 50px;
        margin-bottom: 14px;
    }

    input:not(.isiOS) {
        width: 100%;
        padding: 16px 22px;
    }

    input:focus {
        outline: none;
    }

    input::placeholder {
        color: var(--tg-theme-subtitle-text-color);
        font-size: 17px;
    }

    .bottom-sheet-footer.isiOS {
        padding-inline: 14px;
        padding-block: 5px 14px;
    }

    .bottom-sheet-footer > .list-view {
        background: var(--tg-theme-section-bg-color);
        width: 100%;
    }

    .bottom-sheet-footer.isiOS > .list-view {
        border-radius: 25px;
        overflow: hidden;
    }

    .bottom-sheet-footer > .list-view > :global(div:not(:last-child)::after) {
        content: "";
        position: absolute;
        bottom: 0;
        left: 68px;
        height: 1px;
        right: 0;
        transition: transform 250ms ease;
        background: var(--tg-theme-section-separator-color);
    }

    .bottom-sheet-footer.isiOS > .list-view > :global(div:not(:last-child)::after) {
        left: 14px;
    }

    .bottom-sheet-footer > .add-section {
        background: var(--tg-theme-section-bg-color);
        overflow: hidden;
    }

    .bottom-sheet-footer.isiOS > .add-section {
        margin-top: 20px;
        background: none;
    }

    .bottom-sheet-footer:not(.isiOS) > .add-section {
        padding-inline: 20px;
        padding-block: 15px;
    }
</style>
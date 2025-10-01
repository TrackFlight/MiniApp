<script lang="ts">
    import BottomSheet from "./BottomSheet.svelte";
    import {
        type Link,
        type LinkWithFollowingStatus,
        notifyAppListChanged,
        sessionStore,
        updateLinkPreferences,
        withUIProgress
    } from "../lib/api";
    import {GetLinkDescription, T} from "../lib/translator";
    import {isiOS, telegram} from "../lib/telegram";
    import Divider from "./Divider.svelte";
    import ItemView from "./ItemView.svelte";
    import Button from "./Button.svelte";

    const {
        on_remove,
        on_add,
    } : {
        on_remove: (link: Link) => void,
        on_add: (link: Link) => void,
    } = $props();

    let applyTimeout: ReturnType<typeof setTimeout>;

    async function onPreferenceChange(link: LinkWithFollowingStatus, preference: 'notify_available' | 'notify_closed', value: boolean) {
        link[preference] = value;
        if (link.following) {
            clearTimeout(applyTimeout);
            applyTimeout = setTimeout(async () => {
                await withUIProgress(updateLinkPreferences(link));
                notifyAppListChanged();
            }, 250);
        }
    }
</script>

<!--suppress JSUnusedGlobalSymbols -->
<BottomSheet id="link-info">
    {#snippet children(data: LinkWithFollowingStatus)}
        {@const isAvailable = data.status === 'available'}
        {@const isLocked = sessionStore.appList.some(
            app => app.links
                .filter(link => link.notify_closed || link.notify_available)
                .sort((a, b) => a.added_at - b.added_at)
                .findIndex(link => link.id === data.id) > sessionStore.maxFreeLinks
        ) || !(sessionStore.appList.some(app => app.links.filter(link => link.id === data.id).some(link => link.notify_closed || link.notify_available))) &&
            sessionStore.appList.reduce(
                (acc, app) => acc + app.links.filter(link => link.notify_available || link.notify_closed).length,
                0,
            ) >= sessionStore.maxFreeLinks
        }
        <div class="bottom-sheet-header" class:isiOS>
            <svg height="44px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 46">
                <rect width="60" height="46" rx="23" ry="23" fill="var(--tg-theme-button-color)" />
                <g transform="translate(10.11475, 3.11475)">
                    <path d="M9.98535 29.1504C7.39746 26.5869 7.6416 23.4131 10.6445 20.3857L13.9893 17.0898C13.6719 18.1396 13.6963 19.4092 14.0869 20.2393L12.3535 21.9238C10.3027 23.9258 10.083 25.9521 11.6211 27.4658C13.1592 29.0039 15.1611 28.7109 17.1875 26.7578L19.7266 24.1699C21.8018 22.1436 22.0703 20.1172 20.5811 18.5547C20.1904 18.1885 19.5312 17.8711 18.6768 17.7246C18.9941 16.9678 19.751 16.1377 20.3857 15.7227C20.8496 15.8203 21.6064 16.2842 22.1924 16.9434C24.8047 19.5068 24.5117 22.6807 21.4355 25.7568L18.75 28.4424C15.7227 31.4697 12.5244 31.6895 9.98535 29.1504ZM28.8086 10.2539C31.3965 12.8418 31.1523 16.0156 28.1494 19.043L24.8291 22.3389C25.1465 21.2646 25.0977 20.0195 24.7314 19.1895L26.4648 17.5049C28.4912 15.5029 28.7109 13.4521 27.1729 11.9385C25.6348 10.4248 23.6328 10.6934 21.6309 12.6709L19.0918 15.2588C17.0166 17.2852 16.7236 19.3115 18.2129 20.874C18.6279 21.2158 19.2627 21.5576 20.1416 21.7041C19.7998 22.4365 19.043 23.2666 18.4326 23.7061C17.9688 23.6084 17.1875 23.1445 16.626 22.4854C14.0137 19.8975 14.2822 16.7236 17.3584 13.6475L20.0684 10.9619C23.0957 7.93457 26.2695 7.73926 28.8086 10.2539Z" fill="white"/>
                </g>
            </svg>
            <h4>{data.url}</h4>
            <p class:isAvailable>{GetLinkDescription(data)}</p>
        </div>
        <Divider/>
        <div class="bottom-sheet-footer" class:isiOS>
            {#if isiOS}
                <p>{T('NOTIFICATION_SETTINGS_HEADER').toUpperCase()}</p>
            {/if}
            <div class="list-view" class:isiOS>
                <ItemView
                    title={T('NOTIFICATION_SETTINGS_OPEN_TITLE')}
                    desc={isiOS ? '' : T('NOTIFICATION_SETTINGS_OPEN_DESC')}
                    icon={isiOS ? 'no_icon' : "available_icon"}
                    small={!isiOS}
                    no_ellipsis
                    switchable
                    switchDefault={data.notify_available}
                    on_switch_change={(value) => onPreferenceChange(data, 'notify_available', value)}
                    switchLocked={isLocked}
                />
                <ItemView
                    title={T('NOTIFICATION_SETTINGS_CLOSED_TITLE')}
                    desc={isiOS ? '' : T('NOTIFICATION_SETTINGS_CLOSED_DESC')}
                    icon={isiOS ? 'no_icon' : "closed_icon"}
                    small={!isiOS}
                    no_ellipsis
                    switchable
                    switchDefault={data.notify_closed}
                    on_switch_change={(value) => onPreferenceChange(data, 'notify_closed', value)}
                    switchLocked={isLocked}
                />
            </div>
            <div class="delete-section" class:isiOS>
                {#if data.following}
                    <Button on_click={() => {
                        on_remove(data);
                        telegram.closeBottomSheet('link-info');
                    }} text={T('REMOVE_LINK_BTN')} accent="var(--tg-theme-destructive-text-color)" destructive/>
                {:else}
                    <Button on_click={() => {
                        on_add(data);
                        telegram.closeBottomSheet('link-info');
                    }} text={T('TRACK_LINK_BTN')} accent="var(--tg-theme-button-color)"/>
                {/if}
            </div>
        </div>
    {/snippet}
</BottomSheet>

<style>
    .bottom-sheet-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: 30px 14px 20px;
        background: var(--tg-theme-section-bg-color);
    }

    .bottom-sheet-header.isiOS {
        background: var(--tg-theme-secondary-bg-color);
    }

    .bottom-sheet-header > h4 {
        margin: 20px 0 0;
        font-size: 18px;
        color: var(--tg-theme-text-color);
        font-weight: 500;
        text-align: center;
    }

    .bottom-sheet-header > p {
        margin: 2px 0 0;
        font-size: 14px;
        color: var(--tg-theme-subtitle-text-color);
        text-align: center;
    }

    .bottom-sheet-header > p.isAvailable {
        color: var(--tg-theme-accent-text-color);
    }

    .bottom-sheet-footer.isiOS {
        padding-inline: 14px;
        padding-block: 5px 14px;
    }

    .bottom-sheet-footer > p {
        color: var(--tg-theme-section-header-text-color);
        margin: 0 0 8px 16px;
        font-size: 14px;
    }

    .bottom-sheet-footer > .list-view {
        background: var(--tg-theme-section-bg-color);
        width: 100%;
    }

    .bottom-sheet-footer.isiOS > .list-view {
        border-radius: 10px;
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

    .bottom-sheet-footer > .delete-section {
        background: var(--tg-theme-section-bg-color);
        overflow: hidden;
    }

    .bottom-sheet-footer.isiOS > .delete-section {
        margin-top: 20px;
        border-radius: 10px;
    }

    .bottom-sheet-footer:not(.isiOS) > .delete-section {
        padding-inline: 20px;
        padding-block: 15px;
    }
</style>
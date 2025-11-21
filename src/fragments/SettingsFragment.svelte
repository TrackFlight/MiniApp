<script lang="ts">
    import ScrollablePage from "../components/ScrollablePage.svelte";
    import {T} from "../lib/translator.js";
    import ListView from "../components/ListView.svelte";
    import {isiOS} from "../lib/telegram";
    import ItemView from "../components/ItemView.svelte";
    import ItemDescription from "../components/ItemDescription.svelte";
    import {sessionStore} from "../lib/api";
    import {getApplicationContext} from "../lib/navigation/ActivityManager";

    const {startActivity} =  getApplicationContext();

    function booleanToStatus(value: boolean): string {
        return value ? T('STATUS_ON') : T('STATUS_OFF');
    }

    function openNotificationSettings(title: string, description: string, kind: string) {
        startActivity('notificationSettings', {
            title: title,
            description: description,
            kind: kind,
        });
    }
</script>

<ScrollablePage>
    <div class="settings-content">
        <ListView header={T('NOTIFICATIONS_HEADER')}>
            <ItemView
                title={T('NOTIFICATION_UPDATES_TITLE')}
                desc={T('NOTIFICATION_UPDATES_DESC')}
                icon="icon:bulb:#ffcc00"
                small={!isiOS}
                no_ellipsis
                status="{booleanToStatus(sessionStore.preferences.new_features_notifications)}"
                on_click={() => openNotificationSettings(
                    T('NOTIFICATION_UPDATES_FULL_TITLE'),
                    T('NOTIFICATION_UPDATES_FULL_DESC'),
                    'new_features_notifications'
                )}
            />
            <ItemView
                title={T('NOTIFICATION_INSIGHTS_TITLE')}
                desc={T('NOTIFICATION_INSIGHTS_DESC')}
                icon="icon:newsletter:#32ade6"
                small={!isiOS}
                no_ellipsis
                status="{booleanToStatus(sessionStore.preferences.weekly_insights_notifications)}"
                on_click={() => openNotificationSettings(
                    T('NOTIFICATION_INSIGHTS_FULL_TITLE'),
                    T('NOTIFICATION_INSIGHTS_FULL_DESC'),
                    'weekly_insights_notifications'
                )}
            />
        </ListView>
        <ItemDescription description={T('NOTIFICATIONS_INFO_DESC')} />
    </div>
</ScrollablePage>

<style>
    .settings-content {
        width: 100%;
        padding-bottom: var(--global-navbar-height);
    }
</style>
<script lang="ts">
    import {T} from "../lib/translator";
    import ListView from "../components/ListView.svelte";
    import {isiOS, telegram} from "../lib/telegram";
    import ItemView from "../components/ItemView.svelte";
    import {
        notifyAppListChanged,
        sessionStore,
        updateLinkPreferences,
        updatePreferences,
        withUIProgress
    } from "../lib/api";
    import ItemDescription from "../components/ItemDescription.svelte";

    let {
        kind,
        title,
        description
    } : {
        kind: string,
        title: string,
        description: string
    } = $props();

    let checked = $state(sessionStore.preferences[kind]);
    let applyTimeout: ReturnType<typeof setTimeout>;

    function togglePreferences(toggle: boolean) {
        if (checked === toggle) {
            return;
        }
        sessionStore.preferences[kind] = checked = toggle;
        clearTimeout(applyTimeout);
        applyTimeout = setTimeout(async () => {
            await withUIProgress(updatePreferences());
        }, 250);
    }
</script>

<div class="content">
    <ListView header={title}>
        <ItemView
            title={T('STATUS_ON')}
            icon="no_icon"
            small={!isiOS}
            radio
            radioChecked={checked}
            on_click={() => togglePreferences(true)}
        />
        <ItemView
            title={T('STATUS_OFF')}
            icon="no_icon"
            small={!isiOS}
            radio
            radioChecked={!checked}
            on_click={() => togglePreferences(false)}
        />
    </ListView>
    <ItemDescription description={description} />
</div>
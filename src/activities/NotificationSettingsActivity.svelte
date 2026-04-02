<script lang="ts">
    import {T} from "../lib/translator";
    import ListView from "../components/ListView.svelte";
    import {isiOS, isDesktop} from "../lib/telegram";
    import ItemView from "../components/ItemView.svelte";
    import {
        sessionStore,
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

    let checked = $derived(sessionStore.preferences[kind]);
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

<div class="content" class:isDesktop class:isiOS>
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

<style>
    .content:not(.isiOS):not(.isDesktop) {
        margin-block-start: 10px;
    }
</style>
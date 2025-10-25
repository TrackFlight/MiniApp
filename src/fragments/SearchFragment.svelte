<script lang="ts">
    import InputText from "../components/InputText.svelte";
    import ScrollablePage from "../components/ScrollablePage.svelte";
    import {isiOS} from "../lib/telegram";
    import Divider from "../components/Divider.svelte";
    import {ReadableDateDifference, T} from "../lib/translator";
    import ItemView from "../components/ItemView.svelte";
    import ListView from "../components/ListView.svelte";
    import VirtualList from "../components/VirtualList.svelte";
    import {type App, internalRequest, sessionStore} from "../lib/api";
    import {getApplicationContext} from "../lib/navigation/ActivityManager";
    import {fade} from 'svelte/transition';
    import ItemPlaceholder from "../components/ItemPlaceholder.svelte";
    import StickerView from "../components/StickerView.svelte";

    let textInput = $state('');
    let lastTextInput = $state('');
    let searching = $state(false);
    let noResults = $state(false);
    let searchItems: App[] = $state([]);
    let searchTimeout: ReturnType<typeof setTimeout>;
    const {startActivity, getFragmentContext} = getApplicationContext();
    const {onCapture, onRestore} =  getFragmentContext('searchFragment');

    onCapture(() => {
        return {textInput, searchItems, searching, noResults, lastTextInput};
    });

    onRestore((state: { textInput: string, searching: boolean, searchItems: App[], noResults: boolean, lastTextInput: string }) => {
        searchItems = state.searchItems;
        searching = state.searching;
        noResults = state.noResults;
        lastTextInput = state.lastTextInput;
        textInput = state.textInput;
    });

    $effect(() => {
        if (textInput.trim() === lastTextInput) {
            return;
        }
        lastTextInput = textInput.trim();
        searching = textInput.length > 0;
        searchItems = [];
        noResults = false;
        if (textInput.length === 0) {
            return;
        }
        clearInterval(searchTimeout);
        searchTimeout = setTimeout(async () => {
            const trendingResponse = await internalRequest<App[], null>(
                `apps/search?name=${encodeURIComponent(textInput)}`
            );
            if (trendingResponse.error) {
                return;
            }
            searchItems = trendingResponse.response!;
            noResults = searchItems.length === 0;
        }, 500);
    });
</script>

<ScrollablePage>
    <div class="search-header" class:isiOS>
        <InputText search hint={T('SEARCH_INPUT_TEXT')} bind:text={textInput}/>
    </div>
    <Divider/>
    <div class="content">
        {#if searching && !noResults}
            <div class="search-content" class:hasItems={searchItems.length === 0} class:isiOS transition:fade={{duration: 200}}>
                <ListView header='Search Results'>
                    {#if searchItems.length === 0}
                        <div class="placeholderList" transition:fade={{duration: 150}}>
                            <ItemPlaceholder/>
                            <ItemPlaceholder/>
                            <ItemPlaceholder/>
                        </div>
                    {:else}
                        <VirtualList data={searchItems}>
                        {#snippet children(item: App)}
                            <ItemView
                                id={item.links[0].id}
                                title={item.name ?? T('UNKNOWN_APP')}
                                icon={item.icon_url ? item.icon_url : ''}
                                desc={
                                    T(
                                        'APP_FOLLOWERS_AMOUNT',
                                        {Amount: item.followers},
                                        item.followers,
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
                                    )
                                }
                                on_click={() => {
                                    startActivity('appInfo', {
                                        app: item,
                                    });
                                }}
                            />
                        {/snippet}
                    </VirtualList>
                    {/if}
                </ListView>
            </div>
        {:else if noResults}
            <div class="no-results" transition:fade={{duration: 200}}>
                <StickerView size="120px" sticker="DuckNotFound" autoplay/>
                <h4>{T('NO_RESULTS_TITLE')}</h4>
                <p>{T('NO_RESULTS_DESC', {UserInput: lastTextInput})}</p>
            </div>
        {:else}
            <div class="trending-content" transition:fade={{duration: 200}}>
                <ListView header={T('TRENDING_APPS_HEADER')}>
                    <!--suppress JSUnusedGlobalSymbols -->
                    <VirtualList data={sessionStore.trendingApps}>
                        {#snippet children(item: App)}
                            <ItemView
                                id={item.links[0].id}
                                title={item.name ?? T('UNKNOWN_APP')}
                                desc={
                                    T(
                                        'APP_FOLLOWERS_AMOUNT',
                                        {Amount: item.followers},
                                        item.followers,
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
                                    )
                                }
                                icon={item.icon_url ? item.icon_url : ''}
                                on_click={() => {
                                    startActivity('appInfo', {
                                        app: item,
                                    });
                                }}
                            />
                        {/snippet}
                    </VirtualList>
                </ListView>
            </div>
        {/if}
    </div>

</ScrollablePage>

<style>
    .search-header {
        display: flex;
        width: 100%;
        padding: 9px 14px;
    }

    .search-header:not(.isiOS) {
        background: var(--tg-theme-section-bg-color);
        padding: 12px 14px;
    }

    .content {
        position: relative;
        flex: 1;
        width: 100%;
        overflow-y: auto;
    }

    .content::-webkit-scrollbar {
        display: none;
    }

    .search-content {
        width: 100%;
        position: absolute;
        padding-bottom: var(--global-navbar-height);
    }

    .trending-content {
        position: absolute;
        width: 100%;
        padding-bottom: var(--global-navbar-height);
    }

    .placeholderList {
        position: absolute;
        z-index: 1;
        width: 100%;
        height: calc(66px * 2);
    }

    .search-content.hasItems > :global(div > div) {
        min-height: calc(66px * 3);
    }

    .no-results {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding-inline: 40px;
    }

    .no-results > h4 {
        margin: 10px 0 0;
        color: var(--tg-theme-text-color);
        font-weight: 500;
        font-size: 19px;
    }

    .no-results > p {
        margin: 8px 0 0;
        text-align: center;
        font-size: 15px;
        color: var(--tg-theme-subtitle-text-color);
    }
</style>
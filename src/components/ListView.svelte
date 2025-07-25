<script lang="ts">
    import {isiOS} from "../lib/telegram";

    const { header, children } : {header: string, children: any} = $props();
</script>

<div class="listView" class:isiOS>
    <p>{!isiOS ? header : header.toUpperCase()}</p>
    <div>
        {@render children?.()}
    </div>
</div>

<style>
    .listView {
        padding-inline: 14px;
        padding-block: 10px;
    }

    .listView:not(.isiOS) {
        padding-inline: 0;
        background: var(--tg-theme-section-bg-color);
    }

    .listView:not(.isiOS) > p {
        font-weight: bold;
        font-size: 15px;
        margin-top: 10px;
    }

    .listView > p {
        color: var(--tg-theme-section-header-text-color);
        margin: 0 0 8px 15px;
        font-size: 14px;
    }

    .listView > div {
        background: var(--tg-theme-section-bg-color);
        width: 100%;
        border-radius: 10px;
        overflow: hidden;
    }

    .listView:not(.isiOS) > div {
        border-radius: 0;
    }

    /*noinspection CssUnusedSymbol*/
    .listView > div > :global(div > div:not(:last-child) > .itemView::after),
    .listView > div:global(:has(> div:last-child > div)) > :global(.itemView::after) {
        content: "";
        position: absolute;
        bottom: 0;
        left: 68px;
        height: 1px;
        right: 0;
        transition: transform 250ms ease;
        background: var(--tg-theme-section-separator-color);
    }

    /*noinspection CssUnusedSymbol*/
    .listView > div > :global(div > div:not(:last-child) > .itemView:not(:has(.icon)).isiOS.deletable::after) {
        transform: translateX(var(--delete-width));
    }
</style>
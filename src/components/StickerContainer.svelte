<script lang="ts">
    import {isiOS} from "../lib/telegram";
    import StickerView from "./StickerView.svelte";

    const { title, desc, sticker, children } : {title: string, desc: string, sticker:string, children: any} = $props();
</script>

<div class="sticker-container" class:isiOS>
    <StickerView size="140px" sticker={sticker} autoplay={true}>
        {@render children?.()}
    </StickerView>
    <h2>{title}</h2>
    <p>{desc}</p>
</div>

<style>
    .sticker-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        padding-block: 20px;
        padding-inline: 30px;
        align-items: center;
    }

    .sticker-container:not(.isiOS) {
        background: var(--tg-theme-section-bg-color);
    }

    h2 {
        color: var(--tg-theme-text-color);
        font-size: 23px;
        margin: 20px 0 0;
        text-align: center;
        font-weight: 500;
    }

    p {
        color: var(--tg-theme-hint-color);
        margin: 10px 0 0;
        font-size: 15px;
        text-align: center;
    }
</style>
<script lang="ts">
    import { isiOS } from "../lib/telegram";
    const { title, desc, sticker } : {title: string, desc: string, sticker:string} = $props();
</script>

<div class="sticker-container" class:isiOS>
    <img alt="Sticker" src="src/assets/stickers/{sticker}.gif">
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

    img {
        width: 140px;
        height: 140px;
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
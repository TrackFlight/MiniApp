<script>
</script>

<div class="placeholder">
    <div></div>
</div>

<style>
    .placeholder {
        display: flex;
        align-items: center;
        width: 100%;
    }

    .placeholder::before {
        content: '';
        display: block;
        width: 40px;
        height: 40px;
        margin-inline: 14px;
        margin-block: 13px;
        background-color: var(--tg-theme-text-color);
        border-radius: 20px;
        animation-duration: 1.4s;
        animation-fill-mode: forwards;
        animation-iteration-count: infinite;
        animation-name: shimmer;
        animation-timing-function: linear;
    }

    .placeholder > div {
        width: 80%;
    }

    .placeholder > div::before {
        content: '';
        display: block;
        width: 60%;
        max-width: 170px;
        height: 16px;
        border-radius: 10px;
        background-color: var(--tg-theme-text-color);
        animation-duration: 1.4s;
        animation-fill-mode: forwards;
        animation-iteration-count: infinite;
        animation-name: shimmer;
        animation-timing-function: linear;
    }

    .placeholder > div::after {
        content: '';
        display: block;
        width: 75%;
        max-width: 210px;
        height: 12px;
        margin-top: 7px;
        border-radius: 6px;
        background-color: var(--tg-theme-text-color);
        animation-duration: 1.4s;
        animation-fill-mode: forwards;
        animation-iteration-count: infinite;
        animation-name: shimmer;
        animation-timing-function: linear;
    }

    @keyframes shimmer {
        0% {
            opacity: 0.1;
        }
        50% {
            opacity: 0.25;
        }
        100% {
            opacity: 0.1;
        }
    }
</style>
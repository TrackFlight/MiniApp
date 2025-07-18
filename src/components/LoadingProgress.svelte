<script lang="ts">
    import {isiOS} from "../lib/telegram";
</script>

<div class="animate_loader" class:isiOS>
    <svg style="width:50px;height:50px;" class="circular" viewBox="25 25 50 50">
        <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="4" />
    </svg>
</div>

<style>
    .animate_loader:before {
        content: '';
    }

    .animate_loader .circular {
        animation: rotate 2s linear infinite;
    }

    .animate_loader.isiOS .circular {
        animation: rotateIOS 0.8s linear infinite;
    }

    .animate_loader > svg > .path {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: 0;
        animation: dash 1.5s ease-in-out infinite;
        stroke: var(--tg-theme-hint-color);
        stroke-linecap: round;
    }

    .animate_loader.isiOS > svg > .path {
        animation: none;
        stroke: var(--tg-theme-text-color);
    }

    @keyframes rotate {
        100%{
            transform: rotate(360deg);
        }
    }

    @keyframes rotateIOS {
        100%{
            transform: rotate(-360deg);
        }
    }

    @keyframes dash{
        0%{
            stroke-dasharray: 1,200;
            stroke-dashoffset: 0;
        }
        50%{
            stroke-dasharray: 89,200;
            stroke-dashoffset: -35;
        }
        100%{
            stroke-dasharray: 89,200;
            stroke-dashoffset: -124;
        }
    }
</style>
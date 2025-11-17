<!--suppress CssUnusedSymbol -->
<script lang="ts">
    const { name, id, size } : {name: string, id: number, size: string} = $props();
    const colors = ['red', 'orange', 'purple', 'green', 'cyan', 'blue', 'pink'];
    const colorName = colors[id % colors.length];

    const initials = () => {
        return name.match(/\p{L}+/gu)
            ?.map(word => word[0])
            ?.slice(0, 2)
            .join('') ?? '';
    };
</script>

<div class="named-icon {colorName}" style="width: {size}; height: {size};">
    <p style="font-size: {parseInt(size, 10) * 37.5 / 100}px">{initials()}</p>
</div>

<style>
    .named-icon {
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-shrink: 0;
    }

    .named-icon > p {
        margin: 0;
        font-size: 15px;
        color: white;
        font-family: 'SFProRounded', serif;
        font-weight: bold;
    }

    .red {
        background: linear-gradient(#FF885E, #FF516A);
    }

    .orange {
        background: linear-gradient(#FFCD6A, #FFA85C);
    }

    .purple {
        background: linear-gradient(#82B1FF, #665FFF);
    }

    .green {
        background: linear-gradient(#A0DE7E, #54CB68);
    }

    .cyan {
        background: linear-gradient(#53EDD6, #28C9B7);
    }

    .blue {
        background: linear-gradient(#72D5FD, #2A9EF1);
    }

    .pink {
        background: linear-gradient(#E0A2F3, #D669ED);
    }
</style>
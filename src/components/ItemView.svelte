<script lang="ts">
    import Button from "./Button.svelte";
    import {isiOS, isDesktop} from "../lib/telegram";
    import NamedIcon from "./NamedIcon.svelte";
    import {parseTextWithSpoilers} from "./SimpleSpoiler";
    import SimpleSpoiler from "./SimpleSpoiler.svelte";

    let {
        icon,
        title,
        desc,
        tag,
        id,
        on_click,
        on_delete,
        deletable = $bindable(),
        highlight = false,
        small = false,
    } : {
        icon: string,
        title?: string,
        desc?: string,
        tag?: string,
        id?: number,
        on_click?: () => void,
        on_delete?: () => void,
        deletable?: boolean,
        highlight?: boolean,
        small?: boolean,
    } = $props();

    let titleWithSpoilers = $derived(parseTextWithSpoilers(title))

    function onKeyDelete(e: KeyboardEvent) {
        if ((e.key === "Enter" || e.key === " ") && on_delete) {
            e.preventDefault();
            on_delete();
        }
    }
</script>

<div class="itemView" class:deletable class:isiOS class:isDesktop>
    <Button on_click={() => {if (on_click && (!deletable || !isiOS)) on_click()}}>
        {#if icon === "add"}
            <svg class="icon" width="28px" height="28px" fill="var(--tg-theme-accent-text-color)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22.627 18.252">
                <g>
                    <path d="M6.67969 9.07227L5.36133 10.3906C4.0625 11.6797 4.05273 13.5156 5.37109 14.834C6.67969 16.1328 8.51562 16.1328 9.81445 14.834L12.3145 12.334C12.4198 12.2286 12.5166 12.1195 12.6015 12.0063C12.5079 12.3775 12.4609 12.7658 12.4609 13.1641C12.4609 13.4818 12.4903 13.7929 12.5502 14.0935L10.752 15.8984C8.86719 17.7832 6.21094 17.793 4.31641 15.8887C2.41211 13.9941 2.42188 11.3281 4.30664 9.45312L6.44531 7.31445C6.37695 7.86133 6.43555 8.50586 6.67969 9.07227ZM17.9297 2.23633C19.6683 3.96605 19.8114 6.33073 18.3835 8.16173C18.1129 8.10993 17.8334 8.08594 17.5488 8.08594C17.1516 8.08594 16.7645 8.13235 16.3944 8.22471L16.8848 7.73438C18.1738 6.44531 18.1836 4.60938 16.875 3.29102C15.5664 1.98242 13.7305 1.99219 12.4316 3.29102L9.93164 5.79102C8.64258 7.08008 8.64258 8.91602 9.95117 10.2246C10.3906 10.6738 10.9863 10.9668 11.9043 11.0938L10.7617 12.2559C9.87305 12.041 9.31641 11.7188 8.88672 11.2891C6.98242 9.38477 7.00195 6.72852 8.87695 4.85352L11.4941 2.22656C13.3691 0.341797 16.0352 0.332031 17.9297 2.23633ZM13.3594 6.83594C14.0135 7.49343 14.4406 8.24055 14.6368 9.01487C14.0857 9.3984 13.6155 9.88991 13.2583 10.4587C13.3629 9.56745 13.0424 8.64789 12.2949 7.90039C11.8457 7.45117 11.25 7.1582 10.332 7.03125L11.4844 5.85938C12.373 6.08398 12.9297 6.40625 13.3594 6.83594Z"/>
                    <path d="M21.4844 13.1641C21.4844 15.3223 19.6777 17.1094 17.5488 17.1094C15.3906 17.1094 13.6035 15.332 13.6035 13.1641C13.6035 11.0059 15.3906 9.22852 17.5488 9.22852C19.707 9.22852 21.4844 11.0059 21.4844 13.1641ZM17.041 11.2305L17.041 12.666L15.6055 12.666C15.3027 12.666 15.0977 12.8613 15.0977 13.1641C15.0977 13.4766 15.3027 13.6719 15.6055 13.6719L17.041 13.6719L17.041 15.1074C17.041 15.4102 17.2363 15.6152 17.5488 15.6152C17.8516 15.6152 18.0469 15.4102 18.0469 15.1074L18.0469 13.6719L19.4824 13.6719C19.7949 13.6719 19.9902 13.4766 19.9902 13.1641C19.9902 12.8613 19.7949 12.666 19.4824 12.666L18.0469 12.666L18.0469 11.2305C18.0469 10.918 17.8516 10.7227 17.5488 10.7227C17.2363 10.7227 17.041 10.918 17.041 11.2305Z"/>
                </g>
            </svg>
            <div>
                <p class="addMoreText">{title}</p>
            </div>
        {:else}
            {#if isiOS}
                <div class="deleteBtn" role="button" tabindex="0" onkeydown={onKeyDelete} onclick={() => {if (on_delete) on_delete()}} class:deletable class:isiOS></div>
            {/if}
            {#if icon === "link_loading"}
                <svg style="margin-inline: 12px;margin-block: 11px;min-width: 44px" width="44px" height="44px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 57.7637 53.8818">
                    <defs>
                        <mask id="circle-mask">
                            <rect x="0" y="0" width="100%" height="100%" fill="white"/>
                            <circle
                                cx="45.55"
                                cy="41.1"
                                r="15"
                                fill="black"
                            />
                        </mask>
                    </defs>
                    <g>
                        <g mask="url(#circle-mask)">
                            <circle
                                cx="28.88185"
                                cy="26.9409"
                                r="19"
                                fill="none"
                                stroke="var(--tg-theme-hint-color)"
                                stroke-width="4"
                                stroke-dasharray="5 10"
                                stroke-linecap="round"
                            >
                                <animateTransform
                                    attributeName="transform"
                                    type="rotate"
                                    from="0 28.88185 26.9409"
                                    to="360 28.88185 26.9409"
                                    dur="8s"
                                    repeatCount="indefinite"
                                />
                            </circle>
                        </g>
                        <g transform="translate(10,7)">
                            <path fill="var(--tg-theme-hint-color)" d="M10.3271 28.7842C12.7686 31.2256 15.8447 31.0059 18.75 28.1006L21.3379 25.5127C24.3164 22.5586 24.5605 19.4824 22.0703 16.9922C21.4844 16.3818 20.7764 15.9424 20.3125 15.8447C19.7266 16.2598 18.9941 17.041 18.6768 17.749C19.5068 17.9199 20.1416 18.2129 20.5078 18.5547C21.9727 20.0684 21.6797 22.0215 19.7021 23.9746L17.2363 26.4648C15.3076 28.3691 13.3789 28.6133 11.8896 27.1729C10.4004 25.708 10.6201 23.7305 12.5732 21.8262L14.2334 20.1904C13.8916 19.3848 13.8428 18.1641 14.1602 17.1631L10.9619 20.3369C8.05664 23.2422 7.8125 26.2939 10.3271 28.7842ZM28.4424 10.5957C26.001 8.1543 22.9248 8.34961 20.0195 11.2793L17.4072 13.8672C14.4531 16.8213 14.1846 19.873 16.6748 22.3633C17.2607 22.998 17.9932 23.4375 18.457 23.5352C19.043 23.1201 19.751 22.3389 20.0928 21.6064C19.2383 21.46 18.6279 21.167 18.2617 20.8008C16.7969 19.3115 17.0898 17.3584 19.0674 15.3809L21.5332 12.8906C23.4375 11.0107 25.3906 10.7422 26.8799 12.207C28.3447 13.6719 28.1494 15.625 26.1719 17.5537L24.5117 19.1895C24.8779 19.9951 24.9023 21.2158 24.585 22.2168L27.8076 19.043C30.6885 16.1377 30.9326 13.0859 28.4424 10.5957Z"/>
                        </g>
                        <path fill="var(--tg-theme-hint-color)" d="M54.9072 41.1865C54.9072 46.5576 50.3906 51.0498 45.0684 51.0498C39.6729 51.0498 35.2295 46.6064 35.2295 41.1865C35.2295 35.791 39.6729 31.3477 45.0684 31.3477C50.4639 31.3477 54.9072 35.791 54.9072 41.1865ZM43.8965 35.6201L43.8965 40.1855L40.5762 40.1855C39.8926 40.1855 39.2822 40.7715 39.2822 41.4551C39.2822 42.1387 39.8682 42.7246 40.5762 42.7246L45.1904 42.7246C45.8984 42.7246 46.4355 42.1631 46.4355 41.4551L46.4355 35.6201C46.4355 34.9365 45.874 34.375 45.1904 34.375C44.458 34.375 43.8965 34.9365 43.8965 35.6201Z"/>
                    </g>
                </svg>
            {:else if icon === "link"}
                <svg style="margin-inline: 16px;margin-block: 11px;min-width: 38px" width="38px" height="38px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
                    <circle
                        cx="20"
                        cy="20"
                        r="20"
                        fill="var(--tg-theme-accent-text-color)"
                    />
                    <g transform="translate(4.0918, 4.22852)">
                        <path d="M 7.9883 23.3203 C 5.918 21.2695 6.1133 18.7305 8.5156 16.3086 L 11.1914 13.6718 C 10.9375 14.5117 10.957 15.5274 11.2695 16.1914 L 9.8828 17.539 C 8.2422 19.1406 8.0664 20.7617 9.2969 21.9726 C 10.5274 23.2031 12.1289 22.9687 13.75 21.4062 L 15.7813 19.3359 C 17.4414 17.7149 17.6562 16.0938 16.4649 14.8438 C 16.1523 14.5508 15.625 14.2969 14.9414 14.1797 C 15.1953 13.5742 15.8008 12.9102 16.3086 12.5782 C 16.6797 12.6562 17.2851 13.0274 17.7539 13.5547 C 19.8438 15.6054 19.6094 18.1446 17.1484 20.6054 L 15 22.7539 C 12.5782 25.1758 10.0195 25.3516 7.9883 23.3203 Z M 23.0469 8.2031 C 25.1172 10.2734 24.9218 12.8125 22.5195 15.2344 L 19.8633 17.8711 C 20.1172 17.0117 20.0782 16.0156 19.7851 15.3516 L 21.1718 14.0039 C 22.793 12.4023 22.9687 10.7617 21.7383 9.5508 C 20.5078 8.3398 18.9062 8.5547 17.3047 10.1367 L 15.2734 12.207 C 13.6133 13.8282 13.3789 15.4492 14.5703 16.6992 C 14.9023 16.9726 15.4102 17.2461 16.1133 17.3633 C 15.8398 17.9492 15.2344 18.6133 14.7461 18.9649 C 14.375 18.8867 13.75 18.5156 13.3008 17.9883 C 11.211 15.918 11.4258 13.3789 13.8867 10.918 L 16.0547 8.7695 C 18.4766 6.3477 21.0156 6.1914 23.0469 8.2031 Z" fill="white"/>
                    </g>
                </svg>
            {:else if icon.length > 0}
                <img src="{icon}" alt="ItemIcon" loading="lazy">
            {:else}
                <NamedIcon name={title ? title:''} id={id ? id : 0} size="40px"/>
            {/if}
            <div class="textContainer">
                <div>
                    <p class="itemTitle" class:small>
                        {#each titleWithSpoilers as part}
                            {#if part.type === "text"}
                                {@html part.content}
                            {:else if part.type === "spoiler"}
                                <SimpleSpoiler text={part.content} />
                            {/if}
                        {/each}
                    </p>
                    {#if tag}
                        <p class="itemTag">[<span>#{tag}</span>]</p>
                    {/if}
                </div>
                {#if desc}
                    <p class="itemDesc" class:highlight class:small>{desc}</p>
                {/if}
            </div>
            {#if !isiOS && deletable}
                <Button on_click={() => {if (on_delete) on_delete()}} type="default circle">
                    <svg class="deleteBtn" class:isiOS class:isDesktop width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M5.19995 3.19999C5.19995 1.6536 6.45355 0.399994 7.99995 0.399994H9.99995C11.5463 0.399994 12.8 1.6536 12.8 3.19999V3.39999H17C17.4418 3.39999 17.7999 3.75817 17.7999 4.19999C17.7999 4.64182 17.4418 4.99999 17 4.99999H0.999951C0.558124 4.99999 0.199951 4.64182 0.199951 4.19999C0.199951 3.75817 0.558124 3.39999 0.999951 3.39999H5.19995V3.19999ZM11.2 3.19999V3.39999H6.79995V3.19999C6.79995 2.53725 7.33721 1.99999 7.99995 1.99999H9.99995C10.6627 1.99999 11.2 2.53725 11.2 3.19999ZM2.79544 7.11466C2.74831 6.67535 2.35397 6.35743 1.91467 6.40456C1.47536 6.45169 1.15744 6.84602 1.20456 7.28533L2.51481 19.4987C2.66743 20.9213 3.86805 22 5.29883 22H12.7168C14.1489 22 15.3502 20.9193 15.5012 19.4951L16.7955 7.28432C16.8421 6.84496 16.5237 6.45102 16.0843 6.40445C15.645 6.35788 15.251 6.6763 15.2045 7.11566L13.9101 19.3265C13.8454 19.9368 13.3305 20.4 12.7168 20.4H5.29883C4.68564 20.4 4.17109 19.9377 4.10568 19.328L2.79544 7.11466Z"/>
                    </svg>
                </Button>
            {/if}
        {/if}
    </Button>
</div>

<style>
    /** Item View Button **/
    .itemView {
        position: relative;
        width: 100%;
        --delete-width: 45px;
    }

    .itemView.deletable > :global(div.default.isiOS:not(:has(.icon)):active > div) {
        transform: scale(1);
    }

    .itemView.deletable.isDesktop > :global(div:hover:has(div:hover > div > .deleteBtn)::after),
    .itemView.deletable > :global(div:active:has(div:active > div > .deleteBtn)::after),
    .itemView.deletable.isiOS > :global(div:has(:active, :hover):has(div.deleteBtn)::after) {
        opacity: 0;
    }

    /** Delete button **/
    .deleteBtn:not(.isiOS) {
        margin-inline: 7px;
        margin-block: 5px;
        fill: var(--tg-theme-destructive-text-color);
    }

    .itemView > :global(div > div > div:last-child:has(.deleteBtn)) {
        margin-left: auto;
        margin-right: 24px;
        padding: 5px;
    }

    .itemView > :global(div > div > div.isDesktop:last-child:hover > div > svg) {
        fill: var(--tg-theme-text-color);
    }

    .deleteBtn.isDesktop {
        fill: var(--tg-theme-hint-color);
        transition: fill 120ms ease-in-out;
    }

    .deleteBtn.isiOS:not(:first-child) {
        display: none;
    }

    :not(svg).deleteBtn.isiOS {
        width: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        height: var(--delete-width);
        position: relative;
        transition: width 250ms ease;
        flex-shrink: 0;
    }

    :not(svg).deleteBtn.isiOS:before,
    :not(svg).deleteBtn.isiOS:after {
        transform: translateX(calc(-14px - var(--delete-width)));
        transition: transform 210ms ease-in-out 0ms;
    }

    :not(svg).deleteBtn.isiOS.deletable:before,
    :not(svg).deleteBtn.isiOS.deletable:after {
        transform: translateX(0);
        transition: transform 400ms ease;
    }

    :not(svg).deleteBtn.isiOS:before {
        content: "";
        position: absolute;
        background: var(--tg-theme-destructive-text-color);
        width: 24px;
        height: 24px;
        border-radius: 50%;
        margin-left: 14px;
    }

    :not(svg).deleteBtn.isiOS:after {
        content: "";
        position: absolute;
        width: 12px;
        height: 2px;
        left: calc(50% + 1px);
        top: calc(50% - 1px);
        border-radius: 1px;
        background: #fff;
    }

    .deleteBtn.isiOS.deletable {
        width: var(--delete-width);
    }

    /** Icons and Description **/
    .icon {
        margin-block: 11px;
        margin-inline: 20px;
    }

    /*noinspection CssUnusedSymbol*/
    img, .itemView > :global(div > div > div.named-icon) {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-inline: 14px;
        margin-block: 13px;
    }

    .textContainer {
        overflow: hidden;
        padding-right: 20px;
    }

    .textContainer > div {
        display: flex;
        align-items: center;
        gap: 2px;
    }

    .itemTitle {
        margin: 0;
        color: var(--tg-theme-text-color);
        font-size: 17px;
        font-weight: 500;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .itemTitle.small {
        font-size: 16px;
    }

    .itemTag {
        margin: 0;
        font-weight: 500;
        color: var(--tg-theme-text-color);
        font-size: 17px;
    }

    .itemTag > span {
        font-size: 15px;
        color: var(--tg-theme-subtitle-text-color);
    }

    p:first-child.addMoreText {
        font-weight: 500;
        color: var(--tg-theme-accent-text-color);
    }

    .itemDesc {
        margin: 2px 0 0;
        font-size: 15px;
        color: var(--tg-theme-subtitle-text-color);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .itemDesc.highlight {
        color: var(--tg-theme-accent-text-color);
    }
</style>
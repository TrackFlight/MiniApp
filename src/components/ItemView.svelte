<script lang="ts">
    import {isDesktop, isiOS} from "../lib/telegram";
    import NamedIcon from "./NamedIcon.svelte";
    import {parseTextWithSpoilers} from "./SimpleSpoiler";
    import SimpleSpoiler from "./SimpleSpoiler.svelte";
    import Switch from "./Switch.svelte";
    import RippleEffect from "./RippleEffect.svelte";

    let {
        icon,
        title,
        desc,
        tag,
        id,
        on_click,
        on_delete,
        on_switch_change,
        on_locked_click,
        deletable = $bindable(),
        switchable = $bindable(),
        switchLocked = $bindable(),
        highlight = false,
        small = false,
        no_ellipsis = false,
        allowShowSpoilers = true,
        switchDefault = false
    } : {
        icon: string,
        title?: string,
        desc?: string,
        tag?: string,
        id?: number,
        on_click?: () => void,
        on_delete?: () => void,
        on_switch_change?: (checked: boolean) => void,
        on_locked_click?: () => void,
        deletable?: boolean,
        switchable?: boolean,
        switchLocked?: boolean,
        highlight?: boolean,
        small?: boolean,
        noBoldTitle?: boolean,
        no_ellipsis?: boolean,
        allowShowSpoilers?: boolean,
        switchDefault?: boolean
    } = $props();

    let switchElement: Switch | undefined = $state();
    let titleWithSpoilers = $derived(parseTextWithSpoilers(title))
    let currentSpoilersStatus = $state(true);

    function onKeyDelete(e: KeyboardEvent) {
        if ((e.key === "Enter" || e.key === " ") && on_delete) {
            e.preventDefault();
            on_delete();
        }
    }

    function onClickButton(e: MouseEvent | KeyboardEvent) {
        const target = e.target as HTMLElement;
        if (!target.closest('.clickable')?.classList.contains('itemView')) {
            return;
        }
        if (switchable) {
            if (switchLocked) {
                on_locked_click?.();
            }
            switchElement?.toggle();
        }else if (on_click && (!deletable || !isiOS)) {
            on_click();
        }
    }

    function onKeyButton(e: KeyboardEvent) {
        if ((e.key === "Enter" || e.key === " ") && on_click) {
            e.preventDefault();
            onClickButton(e);
        }
    }
</script>

<div class="itemView clickable allow-divider" class:deletable class:switchable class:isiOS class:isDesktop role="button" tabindex="0" onclick={onClickButton} onkeydown={onKeyButton}>
    {#if !isiOS}
        <RippleEffect rippleColor="color-mix(in srgb, var(--tg-theme-text-color) 5%, transparent)"/>
    {/if}
    <div>
        {#if icon === "add"}
            <svg class="icon" width="28px" height="28px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22.627 18.252">
                <g>
                    <path fill="var(--tg-theme-accent-text-color)" d="M6.67969 9.07227L5.36133 10.3906C4.0625 11.6797 4.05273 13.5156 5.37109 14.834C6.67969 16.1328 8.51562 16.1328 9.81445 14.834L12.3145 12.334C12.4198 12.2286 12.5166 12.1195 12.6015 12.0063C12.5079 12.3775 12.4609 12.7658 12.4609 13.1641C12.4609 13.4818 12.4903 13.7929 12.5502 14.0935L10.752 15.8984C8.86719 17.7832 6.21094 17.793 4.31641 15.8887C2.41211 13.9941 2.42188 11.3281 4.30664 9.45312L6.44531 7.31445C6.37695 7.86133 6.43555 8.50586 6.67969 9.07227ZM17.9297 2.23633C19.6683 3.96605 19.8114 6.33073 18.3835 8.16173C18.1129 8.10993 17.8334 8.08594 17.5488 8.08594C17.1516 8.08594 16.7645 8.13235 16.3944 8.22471L16.8848 7.73438C18.1738 6.44531 18.1836 4.60938 16.875 3.29102C15.5664 1.98242 13.7305 1.99219 12.4316 3.29102L9.93164 5.79102C8.64258 7.08008 8.64258 8.91602 9.95117 10.2246C10.3906 10.6738 10.9863 10.9668 11.9043 11.0938L10.7617 12.2559C9.87305 12.041 9.31641 11.7188 8.88672 11.2891C6.98242 9.38477 7.00195 6.72852 8.87695 4.85352L11.4941 2.22656C13.3691 0.341797 16.0352 0.332031 17.9297 2.23633ZM13.3594 6.83594C14.0135 7.49343 14.4406 8.24055 14.6368 9.01487C14.0857 9.3984 13.6155 9.88991 13.2583 10.4587C13.3629 9.56745 13.0424 8.64789 12.2949 7.90039C11.8457 7.45117 11.25 7.1582 10.332 7.03125L11.4844 5.85938C12.373 6.08398 12.9297 6.40625 13.3594 6.83594Z"/>
                    <path fill="var(--tg-theme-accent-text-color)" d="M21.4844 13.1641C21.4844 15.3223 19.6777 17.1094 17.5488 17.1094C15.3906 17.1094 13.6035 15.332 13.6035 13.1641C13.6035 11.0059 15.3906 9.22852 17.5488 9.22852C19.707 9.22852 21.4844 11.0059 21.4844 13.1641ZM17.041 11.2305L17.041 12.666L15.6055 12.666C15.3027 12.666 15.0977 12.8613 15.0977 13.1641C15.0977 13.4766 15.3027 13.6719 15.6055 13.6719L17.041 13.6719L17.041 15.1074C17.041 15.4102 17.2363 15.6152 17.5488 15.6152C17.8516 15.6152 18.0469 15.4102 18.0469 15.1074L18.0469 13.6719L19.4824 13.6719C19.7949 13.6719 19.9902 13.4766 19.9902 13.1641C19.9902 12.8613 19.7949 12.666 19.4824 12.666L18.0469 12.666L18.0469 11.2305C18.0469 10.918 17.8516 10.7227 17.5488 10.7227C17.2363 10.7227 17.041 10.918 17.041 11.2305Z"/>
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
                <svg style="margin-inline: 12px;margin-block: 11px;flex-shrink: 0;" width="44px" height="44px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 57.7637 53.8818">
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
                                stroke="var(--tg-theme-subtitle-text-color)"
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
                            <path fill="var(--tg-theme-subtitle-text-color)" d="M10.3271 28.7842C12.7686 31.2256 15.8447 31.0059 18.75 28.1006L21.3379 25.5127C24.3164 22.5586 24.5605 19.4824 22.0703 16.9922C21.4844 16.3818 20.7764 15.9424 20.3125 15.8447C19.7266 16.2598 18.9941 17.041 18.6768 17.749C19.5068 17.9199 20.1416 18.2129 20.5078 18.5547C21.9727 20.0684 21.6797 22.0215 19.7021 23.9746L17.2363 26.4648C15.3076 28.3691 13.3789 28.6133 11.8896 27.1729C10.4004 25.708 10.6201 23.7305 12.5732 21.8262L14.2334 20.1904C13.8916 19.3848 13.8428 18.1641 14.1602 17.1631L10.9619 20.3369C8.05664 23.2422 7.8125 26.2939 10.3271 28.7842ZM28.4424 10.5957C26.001 8.1543 22.9248 8.34961 20.0195 11.2793L17.4072 13.8672C14.4531 16.8213 14.1846 19.873 16.6748 22.3633C17.2607 22.998 17.9932 23.4375 18.457 23.5352C19.043 23.1201 19.751 22.3389 20.0928 21.6064C19.2383 21.46 18.6279 21.167 18.2617 20.8008C16.7969 19.3115 17.0898 17.3584 19.0674 15.3809L21.5332 12.8906C23.4375 11.0107 25.3906 10.7422 26.8799 12.207C28.3447 13.6719 28.1494 15.625 26.1719 17.5537L24.5117 19.1895C24.8779 19.9951 24.9023 21.2158 24.585 22.2168L27.8076 19.043C30.6885 16.1377 30.9326 13.0859 28.4424 10.5957Z"/>
                        </g>
                        <path fill="var(--tg-theme-subtitle-text-color)" d="M54.9072 41.1865C54.9072 46.5576 50.3906 51.0498 45.0684 51.0498C39.6729 51.0498 35.2295 46.6064 35.2295 41.1865C35.2295 35.791 39.6729 31.3477 45.0684 31.3477C50.4639 31.3477 54.9072 35.791 54.9072 41.1865ZM43.8965 35.6201L43.8965 40.1855L40.5762 40.1855C39.8926 40.1855 39.2822 40.7715 39.2822 41.4551C39.2822 42.1387 39.8682 42.7246 40.5762 42.7246L45.1904 42.7246C45.8984 42.7246 46.4355 42.1631 46.4355 41.4551L46.4355 35.6201C46.4355 34.9365 45.874 34.375 45.1904 34.375C44.458 34.375 43.8965 34.9365 43.8965 35.6201Z"/>
                    </g>
                </svg>
            {:else if icon === "link" || icon === "link_checked"}
                <svg style="margin-inline: 16px;margin-block: 11px;flex-shrink: 0;" width="38px" height="38px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
                    <defs>
                        <mask id="circle-mask">
                            <rect x="0" y="0" width="100%" height="100%" fill="white"/>
                            <circle cx="31" cy="31" r="11.25" fill="black"/>
                        </mask>
                    </defs>
                    <g mask={icon === "link_checked" ? "url(#circle-mask)" : null}>
                        <circle
                            cx="20"
                            cy="20"
                            r="20"
                            fill="var(--tg-theme-button-color)"
                        />
                        <g transform="translate(4.0918, 4.22852)">
                            <path d="M 7.9883 23.3203 C 5.918 21.2695 6.1133 18.7305 8.5156 16.3086 L 11.1914 13.6718 C 10.9375 14.5117 10.957 15.5274 11.2695 16.1914 L 9.8828 17.539 C 8.2422 19.1406 8.0664 20.7617 9.2969 21.9726 C 10.5274 23.2031 12.1289 22.9687 13.75 21.4062 L 15.7813 19.3359 C 17.4414 17.7149 17.6562 16.0938 16.4649 14.8438 C 16.1523 14.5508 15.625 14.2969 14.9414 14.1797 C 15.1953 13.5742 15.8008 12.9102 16.3086 12.5782 C 16.6797 12.6562 17.2851 13.0274 17.7539 13.5547 C 19.8438 15.6054 19.6094 18.1446 17.1484 20.6054 L 15 22.7539 C 12.5782 25.1758 10.0195 25.3516 7.9883 23.3203 Z M 23.0469 8.2031 C 25.1172 10.2734 24.9218 12.8125 22.5195 15.2344 L 19.8633 17.8711 C 20.1172 17.0117 20.0782 16.0156 19.7851 15.3516 L 21.1718 14.0039 C 22.793 12.4023 22.9687 10.7617 21.7383 9.5508 C 20.5078 8.3398 18.9062 8.5547 17.3047 10.1367 L 15.2734 12.207 C 13.6133 13.8282 13.3789 15.4492 14.5703 16.6992 C 14.9023 16.9726 15.4102 17.2461 16.1133 17.3633 C 15.8398 17.9492 15.2344 18.6133 14.7461 18.9649 C 14.375 18.8867 13.75 18.5156 13.3008 17.9883 C 11.211 15.918 11.4258 13.3789 13.8867 10.918 L 16.0547 8.7695 C 18.4766 6.3477 21.0156 6.1914 23.0469 8.2031 Z" fill="white"/>
                        </g>
                    </g>
                    {#if icon === "link_checked"}
                        <circle cx="31" cy="31" r="9" fill="#5ec244"/>
                        <g transform="translate(-11.2, -6.5) scale(0.9)">
                            <path d="M45.5566 47.0947C45.2148 47.0947 44.7754 46.9482 44.5312 46.6553L41.2354 43.0664C40.9912 42.7979 40.8936 42.4316 40.8936 42.1387C40.8936 41.4062 41.4795 40.8203 42.1875 40.8203C42.627 40.8203 42.9443 41.0156 43.1641 41.2598L45.5078 43.7744L50.1709 37.2803C50.3906 36.9629 50.7812 36.7188 51.2695 36.7188C51.9531 36.7188 52.5635 37.2559 52.5635 38.0127C52.5635 38.2324 52.4658 38.501 52.2705 38.7695L46.6309 46.6064C46.4355 46.8994 45.9961 47.0947 45.5566 47.0947Z" fill="white"/>
                        </g>
                    {/if}
                </svg>
            {:else if icon === "available_icon"}
                <svg style="margin-inline: 18px;margin-block: 13px;flex-shrink: 0;" width="36px" height="36px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68.2861 62.3291">
                    <g>
                        <path d="M38.0859 10.8887L54.9072 22.7539C56.7139 24.0479 57.251 25.4883 57.251 28.1738L57.251 37.0649C56.7022 36.977 56.1385 36.9385 55.5664 36.9385C55.0029 36.9385 54.4474 36.9761 53.9062 37.062L53.9062 27.5635C53.9062 27.5227 53.9058 27.4824 53.9039 27.4437L42.7481 38.5996L45.909 41.4469C45.2086 42.2589 44.6143 43.1634 44.1538 44.1427L35.7422 36.5723C35.2051 36.084 34.5947 35.8398 33.96 35.8398C33.3496 35.8398 32.7393 36.084 32.2021 36.5723L17.1739 50.0977L42.8947 50.0977C42.9218 51.2517 43.119 52.3641 43.4516 53.418L16.9189 53.418C12.7686 53.418 10.6934 51.3916 10.6934 47.29L10.6934 28.1738C10.6934 25.4883 11.2305 24.0479 13.0371 22.7539L29.834 10.8887C32.9346 8.71582 34.9854 8.71582 38.0859 10.8887ZM14.0381 27.5635L14.0381 47.29C14.0381 47.7445 14.0981 48.1447 14.2151 48.4893L25.188 38.5913L14.0404 27.4437ZM32.251 13.2568L15.8174 24.7041L27.5626 36.4493L30.3223 33.96C31.4453 32.959 32.6904 32.4707 33.96 32.4707C35.2539 32.4707 36.499 32.959 37.5977 33.96L40.372 36.4591L52.1265 24.7046L35.6689 13.2568C34.375 12.3291 33.5205 12.3291 32.251 13.2568Z" fill="var(--tg-theme-subtitle-text-color)"/>
                        <path d="M65.4297 49.6338C65.4297 55.0049 60.9131 59.4727 55.5664 59.4727C50.1709 59.4727 45.7275 55.0537 45.7275 49.6338C45.7275 44.2383 50.1709 39.7949 55.5664 39.7949C60.9863 39.7949 65.4297 44.2383 65.4297 49.6338ZM54.4189 44.0674L54.4189 48.6328L51.0986 48.6328C50.3906 48.6328 49.8047 49.1943 49.8047 49.9023C49.8047 50.5859 50.3662 51.1719 51.0986 51.1719L55.6885 51.1719C56.4209 51.1719 56.958 50.6104 56.958 49.9023L56.958 44.0674C56.958 43.3838 56.3965 42.8223 55.6885 42.8223C54.9805 42.8223 54.4189 43.3838 54.4189 44.0674Z" fill="var(--tg-theme-subtitle-text-color)"/>
                    </g>
                </svg>
            {:else if icon === "closed_icon"}
                <svg style="margin-inline: 18px;margin-block: 13px;flex-shrink: 0;" width="36px" height="36px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68.2861 51.5381">
                    <g>
                        <path d="M57.251 15.2344L57.251 26.2739C56.7022 26.186 56.1385 26.1475 55.5664 26.1475C55.0029 26.1475 54.4474 26.1851 53.9062 26.271L53.9062 15.2344C53.9062 15.098 53.9008 14.9666 53.8885 14.8416L42.6839 24.9349L47.1464 29.3974C46.3395 30.0999 45.6311 30.9108 45.0333 31.8009L40.3077 27.0753L37.5977 29.5166C36.499 30.542 35.2539 31.0059 33.96 31.0059C32.6904 31.0059 31.4453 30.542 30.3223 29.5166L27.6261 27.0846L15.7043 38.9847C16.0186 39.086 16.3764 39.1357 16.7725 39.1357L42.886 39.1357C42.9012 40.2885 43.0827 41.4019 43.4052 42.4561L16.9189 42.4561C12.7686 42.4561 10.6934 40.4297 10.6934 36.3281L10.6934 15.2344C10.6934 11.1328 12.7441 9.10645 16.2354 9.10645L51.0254 9.10645C55.1514 9.10645 57.251 11.1328 57.251 15.2344ZM14.0381 15.21L14.0381 36.1547L25.2401 24.9323L14.0537 14.8417C14.0429 14.9595 14.0381 15.0826 14.0381 15.21ZM16.7725 12.4268C16.5584 12.4268 16.3555 12.4413 16.1645 12.4704L32.2021 26.9043C32.7393 27.417 33.3496 27.6611 33.96 27.6611C34.5947 27.6611 35.2051 27.417 35.7422 26.9043L51.7774 12.4726C51.58 12.442 51.3698 12.4268 51.1475 12.4268Z" fill="var(--tg-theme-subtitle-text-color)"/>
                        <path d="M65.4297 38.8428C65.4297 44.2139 60.9131 48.6816 55.5664 48.6816C50.1709 48.6816 45.7275 44.2627 45.7275 38.8428C45.7275 33.4473 50.1709 29.0039 55.5664 29.0039C60.9863 29.0039 65.4297 33.4473 65.4297 38.8428ZM50.7324 37.5732C50.0244 37.5732 49.4629 38.1836 49.4629 38.8428C49.4629 39.502 50.0244 40.1123 50.7324 40.1123L60.4248 40.1123C61.1328 40.1123 61.6943 39.502 61.6943 38.8428C61.6943 38.1836 61.1328 37.5732 60.4248 37.5732Z" fill="var(--tg-theme-subtitle-text-color)"/>
                    </g>
                </svg>
            {:else if icon !== "no_icon" && icon.length > 0}
                <img src="{icon}" alt="ItemIcon" loading="lazy">
            {:else if icon !== "no_icon"}
                <NamedIcon name={title ? title:''} id={id ? id : 0} size="40px"/>
            {/if}
            {@const isNoIcon = icon === "no_icon"}
            {@const isNoDesc = !desc || desc.length === 0}
            <div class="textContainer" class:isNoIcon class:isNoDesc>
                <div>
                    <p class="itemTitle" class:small class:switchable>
                        {#each titleWithSpoilers as part}
                            {#if part.type === "text"}
                                {@html part.content}
                            {:else if part.type === "spoiler"}
                                <SimpleSpoiler text={part.content} clickable={allowShowSpoilers} on_click={() => currentSpoilersStatus = false} hide={currentSpoilersStatus} />
                            {/if}
                        {/each}
                    </p>
                    {#if tag}
                        <p class="itemTag">[<span>#{tag}</span>]</p>
                    {/if}
                </div>
                {#if desc}
                    <p class="itemDesc" class:no_ellipsis class:highlight class:small class:switchable>{desc}</p>
                {/if}
            </div>
            {#if !isiOS && deletable && !switchable}
                <div class="deleteBtn clickable" role="button" tabindex="0" onkeydown={onKeyDelete} onclick={() => {if (on_delete) on_delete()}} class:isiOS class:isDesktop>
                    <svg width="18" height="22" viewBox="0 0 18 22" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M5.19995 3.19999C5.19995 1.6536 6.45355 0.399994 7.99995 0.399994H9.99995C11.5463 0.399994 12.8 1.6536 12.8 3.19999V3.39999H17C17.4418 3.39999 17.7999 3.75817 17.7999 4.19999C17.7999 4.64182 17.4418 4.99999 17 4.99999H0.999951C0.558124 4.99999 0.199951 4.64182 0.199951 4.19999C0.199951 3.75817 0.558124 3.39999 0.999951 3.39999H5.19995V3.19999ZM11.2 3.19999V3.39999H6.79995V3.19999C6.79995 2.53725 7.33721 1.99999 7.99995 1.99999H9.99995C10.6627 1.99999 11.2 2.53725 11.2 3.19999ZM2.79544 7.11466C2.74831 6.67535 2.35397 6.35743 1.91467 6.40456C1.47536 6.45169 1.15744 6.84602 1.20456 7.28533L2.51481 19.4987C2.66743 20.9213 3.86805 22 5.29883 22H12.7168C14.1489 22 15.3502 20.9193 15.5012 19.4951L16.7955 7.28432C16.8421 6.84496 16.5237 6.45102 16.0843 6.40445C15.645 6.35788 15.251 6.6763 15.2045 7.11566L13.9101 19.3265C13.8454 19.9368 13.3305 20.4 12.7168 20.4H5.29883C4.68564 20.4 4.17109 19.9377 4.10568 19.328L2.79544 7.11466Z"/>
                    </svg>
                    <RippleEffect rippleColor="color-mix(in srgb, var(--tg-theme-text-color) 5%, transparent)"/>
                </div>
            {/if}
            {#if switchable && !deletable}
                <Switch bind:this={switchElement} switchLocked={switchLocked} on_change={on_switch_change} defaultState={switchDefault}/>
            {/if}
        {/if}
    </div>
</div>

<style>
    /** Item View Button **/
    .itemView {
        position: relative;
        width: 100%;
        user-select: none;
        cursor: pointer;
        --delete-width: 45px;
        z-index: 0;
    }

    .itemView > div {
        display: flex;
        align-items: center;
        width: 100%;
    }

    .itemView.isiOS > div {
        transition: transform 140ms ease-out;
        transform-origin: center;
    }

    .itemView:not(:is(.deletable, .switchable)).isiOS:active > div {
        transform: scale(0.97);
    }

    .deleteBtn {
        flex-shrink: 0;
    }

    .itemView:before, .deleteBtn:not(.isiOS):before {
        content: "";
        position: absolute;
        top:0;
        left:0;
        right:0;
        bottom:0;
        background: var(--tg-theme-text-color);
        opacity: 0;
        transition: opacity 120ms ease-out;
        pointer-events: none;
    }

    /*noinspection CssUnusedSymbol*/
    .itemView.isDesktop:hover:not(:has(.deleteBtn:hover, .deleteBtn:active)):before,
    .deleteBtn:not(.isiOS):is(.isDesktop:hover, :active):before {
        opacity: 0.04;
    }

    /** Delete button **/
    .deleteBtn:not(.isiOS) > svg {
        margin-inline: 7px;
        margin-block: 5px;
        fill: var(--tg-theme-destructive-text-color);
    }

    .deleteBtn:not(.isiOS) {
        margin-left: auto;
        margin-right: 24px;
        padding: 5px;
        position: relative;
        width: 41px;
        height: 41px;
        border-radius: 50%;
        overflow: hidden;
    }

    .deleteBtn.isDesktop:hover > svg {
        fill: var(--tg-theme-text-color);
    }

    .deleteBtn.isDesktop > svg {
        fill: var(--tg-theme-hint-color);
        transition: fill 120ms ease-in-out;
    }

    .deleteBtn.isiOS {
        width: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        height: var(--delete-width);
        position: relative;
        transition: width 250ms ease;
        flex-shrink: 0;
    }

    .deleteBtn.isiOS:before,
    .deleteBtn.isiOS:after {
        transform: translateX(calc(-14px - var(--delete-width)));
        transition: transform 210ms ease-in-out 0ms;
    }

    .deleteBtn.isiOS.deletable:before,
    .deleteBtn.isiOS.deletable:after {
        transform: translateX(0);
        transition: transform 400ms ease;
    }

    .deleteBtn.isiOS:before {
        content: "";
        position: absolute;
        background: var(--tg-theme-destructive-text-color);
        width: 24px;
        height: 24px;
        border-radius: 50%;
        margin-left: 14px;
    }

    .deleteBtn.isiOS:after {
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
    img, .itemView > div > :global(div.named-icon) {
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

    .textContainer.isNoIcon {
        padding-inline: 17px;
        padding-block: 10px;
    }

    .textContainer.isNoDesc {
        padding-block: 14px;
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

    .itemTitle.switchable {
        font-weight: normal;
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
    }

    .itemDesc:not(.no_ellipsis) {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .itemDesc.switchable {
        margin: 5px 0 0;
        font-size: 14px;
    }

    .itemDesc.highlight {
        color: var(--tg-theme-accent-text-color);
    }

    .itemView > div > :global(.switch) {
        margin-left: auto;
        margin-right: 20px;
    }
</style>
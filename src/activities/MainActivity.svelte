<script lang="ts">
    import Bulletin from "../components/Bulletin.svelte";
    import HomeFragment from "../fragments/HomeFragment.svelte";
    import Navbar from "../components/Navbar.svelte";
    import {onMount} from "svelte";
    import {isiOS, telegram} from "../lib/telegram";
    import AddLinkBottomSheet from "../components/AddLinkBottomSheet.svelte";
    import ViewPager from "../components/ViewPager.svelte";
    import SearchFragment from "../fragments/SearchFragment.svelte";
    import {fade} from 'svelte/transition';

    onMount(telegram.BackButton.hide);

    let pager: ViewPager;
    const fragments = [
        HomeFragment,
        SearchFragment
    ];
</script>

<div class="content">
    <ViewPager fragments={fragments} bind:this={pager}/>
    <Bulletin/>
</div>
<Navbar pager={pager} tabs={['Home', 'Apps']}>
    {#snippet children(index: Number)}
        {#if index === 0}
            {#if isiOS}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46.9727 40.6982">
                    <path d="M18.1641 37.1582L18.1641 26.0986C18.1641 25.1709 18.7988 24.5605 19.7266 24.5605L26.9043 24.5605C27.8564 24.5605 28.4424 25.1709 28.4424 26.0986L28.4424 37.1582ZM6.27441 36.2549C6.27441 39.0381 7.95898 40.6738 10.791 40.6738L35.8398 40.6738C38.6719 40.6738 40.3564 39.0381 40.3564 36.2549L40.3564 21.8262L24.4385 8.49609C23.7549 7.91016 22.8516 7.93457 22.1924 8.49609L6.27441 21.8262ZM1.9043 21.0693C2.51465 21.0693 3.02734 20.7275 3.4668 20.3613L22.6807 4.22363C22.876 4.05273 23.1201 3.97949 23.3154 3.97949C23.5107 3.97949 23.7305 4.05273 23.9258 4.22363L43.1641 20.3613C43.6035 20.7275 44.1162 21.0693 44.7266 21.0693C45.9229 21.0693 46.6309 20.2148 46.6309 19.3115C46.6309 18.8232 46.4111 18.2861 45.9473 17.8955L25.7568 0.952148C24.9756 0.317383 24.1455 0 23.3154 0C22.4854 0 21.6309 0.317383 20.874 0.952148L0.683594 17.8955C0.219727 18.2861 0 18.8232 0 19.3115C0 20.2148 0.708008 21.0693 1.9043 21.0693ZM35.5469 10.0586L40.8203 14.502L40.8203 5.66406C40.8203 4.73633 40.21 4.15039 39.2822 4.15039L37.085 4.15039C36.1816 4.15039 35.5469 4.73633 35.5469 5.66406Z"/>
                </svg>
            {:else}
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
                    <path d="M160-200v-360q0-19 8.5-36t23.5-28l240-180q21-16 48-16t48 16l240 180q15 11 23.5 28t8.5 36v360q0 33-23.5 56.5T720-120H600q-17 0-28.5-11.5T560-160v-200q0-17-11.5-28.5T520-400h-80q-17 0-28.5 11.5T400-360v200q0 17-11.5 28.5T360-120H240q-33 0-56.5-23.5T160-200Z"/>
                </svg>
            {/if}
        {:else if index === 1}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                <path d="M200-520q-33 0-56.5-23.5T120-600v-160q0-33 23.5-56.5T200-840h160q33 0 56.5 23.5T440-760v160q0 33-23.5 56.5T360-520H200Zm0 400q-33 0-56.5-23.5T120-200v-160q0-33 23.5-56.5T200-440h160q33 0 56.5 23.5T440-360v160q0 33-23.5 56.5T360-120H200Zm400-400q-33 0-56.5-23.5T520-600v-160q0-33 23.5-56.5T600-840h160q33 0 56.5 23.5T840-760v160q0 33-23.5 56.5T760-520H600Zm0 400q-33 0-56.5-23.5T520-200v-160q0-33 23.5-56.5T600-440h160q33 0 56.5 23.5T840-360v160q0 33-23.5 56.5T760-120H600Z"/>
            </svg>
        {/if}
    {/snippet}
</Navbar>
<AddLinkBottomSheet/>

<style>
    .content {
        flex: 1;
        overflow: hidden;
        position: relative;
    }
</style>
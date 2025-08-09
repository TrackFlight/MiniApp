<script lang="ts">
    import Bulletin from "../components/Bulletin.svelte";
    import HomeFragment from "../fragments/HomeFragment.svelte";
    import Navbar from "../components/Navbar.svelte";
    import {onMount} from "svelte";
    import {telegram} from "../lib/telegram";
    import AddLinkBottomSheet from "../components/AddLinkBottomSheet.svelte";

    onMount(telegram.BackButton.hide);
</script>

<div class="content">
    <HomeFragment/>
    <Bulletin/>
</div>
<Navbar/>
<AddLinkBottomSheet/>

<style>
    .content {
        flex: 1;
        overflow: hidden;
        position: relative;
    }
</style>
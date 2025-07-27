<script>
    import Bulletin from "../components/Bulletin.svelte";
    import HomeFragment from "../fragments/HomeFragment.svelte";
    import Navbar from "../components/Navbar.svelte";
</script>

<div class="content">
    <div>
        <HomeFragment/>
    </div>
    <Bulletin/>
</div>
<Navbar/>

<style>
    .content {
        flex: 1;
        overflow: hidden;
        position: relative;
    }

    .content > div {
        height: 100%;
        overflow-y: auto;
        padding-bottom: 10px;
    }

    .content > div::-webkit-scrollbar {
        display: none;
    }
</style>
<script lang="ts">
import '../../app.css'
import { PUBLIC_META_TITLE } from '$env/static/public';
import Switcher from '$lib/switcher/switcher.svelte'
import Sidebar from '$lib/sidebar/sidebar.svelte'
</script>

<svelte:head>
    <title>{PUBLIC_META_TITLE}</title>
</svelte:head>

<div class="grid grid-cols-[72px_232px_1fr] h-screen">
    <Switcher />
    <Sidebar />
    <div class="bg-view">
        <slot></slot>
    </div>
</div>

<style>
</style>

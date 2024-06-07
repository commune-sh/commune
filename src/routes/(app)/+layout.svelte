<script lang="ts">
import '../../app.css'
import { PUBLIC_META_TITLE } from '$env/static/public';
import Switcher from '$lib/switcher/switcher.svelte'
import Sidebar from '$lib/sidebar/sidebar.svelte'
</script>

<svelte:head>
    <title>{PUBLIC_META_TITLE}</title>
</svelte:head>

<div class="root grid grid-cols-[304px_1fr] h-screen">
    <div class="sidebar grid grid-cols-[72px_232px]">
        <Switcher />
        <Sidebar />
    </div>
    <div class="view grid grid-rows-[52px_1fr] bg-view">
        <div class="header bg-header"></div>
        <slot></slot>
    </div>
</div>

<style>
@media (max-width: 768px) {
    .root {
    }
    .sidebar {
    }
}
</style>

<script lang="ts">
import '../../app.css'
import { PUBLIC_META_TITLE } from '$env/static/public';
import { browser } from '$app/environment';
import Matrix from '$lib/matrix/matrix.svelte'

import Switcher from '$lib/switcher/switcher.svelte'
import Sidebar from '$lib/sidebar/sidebar.svelte'
import Auth from '$lib/auth/auth.svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()


let { data } = $props();

$effect(() => {
    if(data?.public_server_exists && data?.capabilities) {
        console.log("Public server capabilities: ", data.capabilities)
        store.updateCapabilities(data.capabilities)
    }
})

</script>

<svelte:head>
    <title>{PUBLIC_META_TITLE}</title>
</svelte:head>

<div class="root grid grid-cols-[304px_1fr] h-screen">
    <div class="sidebar grid grid-cols-[72px_232px]">
        <Switcher />
        <Sidebar />
    </div>
    <div class="view grid grid-rows-[52px_1fr] bg-view h-screen">
        <div class="header bg-header"></div>
        <slot></slot>
    </div>
</div>

<Matrix />

<Auth />

<style>
@media (max-width: 768px) {
    .root {
    }
    .sidebar {
    }
}
</style>

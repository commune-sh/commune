<script lang="ts">
import '../../app.css'
import { PUBLIC_META_TITLE } from '$env/static/public';
import { onMount } from 'svelte'
import { browser } from '$app/environment';

import Switcher from '$lib/switcher/switcher.svelte'
import Sidebar from '$lib/sidebar/sidebar.svelte'
import Auth from '$lib/auth/auth.svelte'

import Matrix from '$lib/matrix/matrix.svelte'

// app store
import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

// matrix client store
import { createMatrixClient } from '$lib/store/matrix.svelte.js'
const matrixClient = createMatrixClient()

// auth store
import { createAuthStore } from '$lib/store/auth.svelte.js'
const authStore = createAuthStore()
const authReady = $derived(authStore.ready)

// derive credentials from auth store
const credentials = $derived(authStore.credentials)


// data from server fetch
let { data } = $props();

// derive native mode from app store
let native_mode = $derived(store.native_mode)


let homeserver_reachable = $derived(data.homeserver_reachable)

$effect(() => {
    if(browser && !authReady) {
        authStore.setup()
    }
})

onMount(() => {
    // set app to native matrix client mode
    if(!data?.public_server_exists && !data?.public_server_unreachable) {
        store.isNativeMode();
    }

    // store server capabilities
    if(data?.public_server_exists && data?.capabilities) {
        store.updateCapabilities(data.capabilities)
    }
})

</script>

<Matrix />

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

<Auth />

<style>
@media (max-width: 768px) {
    .root {
    }
    .sidebar {
    }
}
</style>

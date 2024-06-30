<script lang="ts">
import '../../app.css'
import { 
    PUBLIC_SERVER,
    PUBLIC_META_TITLE,
} from '$env/static/public';

import { onMount } from 'svelte'
import { browser } from '$app/environment';

import { getCapabilities } from '$lib/public_server/requests'
import { getVersions } from '$lib/matrix/requests'

import Listeners from '$lib/listeners/listeners.svelte'

import Layout from '$lib/layout/layout.svelte'

import HomeserverDown from '$lib/alert/homeserver-down.svelte'

import Matrix from '$lib/matrix/matrix.svelte'
import Settings from '$lib/settings/settings.svelte'


// app store
import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

// derive credentials from auth store
const credentials = $derived(store.auth.credentials)

let authReady = $derived(store.auth.ready)

// data from server fetch
let { data, children } = $props();

// derive native mode from app store
let native_mode = $derived(store.app.native_mode)

let homeserver_reachable = $derived(data.homeserver_reachable)

$effect(() => {
    if(browser && !authReady) {
        store.auth.setup({
            authenticated: data?.authenticated,
            access_token: data?.access_token || null,
            user_id: data?.user_id || null,
            device_id: data?.device_id || null,
        })
    }
    if(data) {
        //console.log($state.snapshot(data))
    }
})

async function setup() {
    try {
        const resp = await getCapabilities();
        if(resp?.capabilities) {
            store.app.updatePublicServerStatus()
            store.app.updateCapabilities(data.capabilities)
        }
    } catch(_) {
        store.app.isNativeMode();
    }
    try {
        const resp = await getVersions();
        if(resp?.versions) {
            store.app.updateHomeserverStatus(resp)
        }
    } catch(_) {
    }
}

onMount(() => {
    store.matrix.getFlows()
    if(!data?.native_mode) {
        setup()
    }
})

</script>

<Listeners />

<HomeserverDown />

<Matrix />

<svelte:head>
    <title>{PUBLIC_META_TITLE}</title>
</svelte:head>


{#snippet content()}
    {@render children()}
{/snippet}

<Layout {data} {content} />

<Settings />

<style>
.menu-active {
    grid-template-columns: 72px 1fr;
}

.slide-in {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 72px;
    place-self: stretch;
    width: 100%;
}

.mask {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 304px;
    height: 100%;
    z-index: 10000;
    width: 100vw;
}

</style>

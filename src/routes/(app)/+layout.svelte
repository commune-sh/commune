<script lang="ts">
import '../../app.css'
import { PUBLIC_META_TITLE } from '$env/static/public';
import { onMount } from 'svelte'
import { browser } from '$app/environment';

import { getCapabilities } from '$lib/public_server/requests'
import { getVersions } from '$lib/matrix/requests'

import Switcher from '$lib/switcher/switcher.svelte'

import Auth from '$lib/auth/auth.svelte'
import Alert from '$lib/alert/alert.svelte'

import Matrix from '$lib/matrix/matrix.svelte'
import Settings from '$lib/settings/settings.svelte'


// app store
import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()


const menu_active = $derived(store.ui.menu_active)

const alert_active = $derived(store.ui.alert?.active)


// derive credentials from auth store
const credentials = $derived(store.auth.credentials)


let authReady = $derived(store.auth.ready)

// data from server fetch
let { data } = $props();

// derive native mode from app store
let native_mode = $derived(store.client.native_mode)


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
            store.client.updatePublicServerStatus()
            store.client.updateCapabilities(data.capabilities)
        }
    } catch(_) {
        store.client.isNativeMode();
    }
    try {
        const resp = await getVersions();
        if(resp?.versions) {
            console.log(resp)
            store.client.updateHomeserverStatus(resp)
        }
    } catch(_) {
    }
}

let root;

onMount(() => {
    setup()

    let mq = window.matchMedia("(min-width: 768px)");
    mq.addEventListener("change", (e) => {
        if(e?.matches == true && menu_active) {
            store.ui.toggleMenu()
            root.style.width = `auto`
        }
        if(e?.matches == true && root) {
            root.style.width = `auto`
        }
    });
})

function killMenu() {
    store.ui.killMenu()
}

let title = $derived.by(() => {
    if(data?.space_state != undefined)  {
        return `${data?.space_state?.name} - ${PUBLIC_META_TITLE}`
    } 
    return PUBLIC_META_TITLE
})

$effect(() => {
    if(data?.space_state != undefined)  {
        store.matrix.updateSpaces([data.space_state])
    }
})

</script>

<Matrix />

<svelte:head>
    <title>{title}</title>
</svelte:head>

{#if menu_active}
<div class="mask" onclick={killMenu}>
</div>
{/if}

<main class="app grid h-dvh" class:grid-rows-[auto_1fr]={alert_active}>

{#if alert_active}
    <Alert />
{/if}

<div class:root={!menu_active} 
        class="grid grid-cols-[72px_1fr] h-full select-none" bind:this={root}
class:menu-active={menu_active}>
    <div class="switcher grid"
    class:show={menu_active}>
        <Switcher />
    </div>
    <div class="view grid bg-view h-full"
    class:slide-in={menu_active}>
        <slot {data} />
    </div>
</div>
</main>

<Auth />
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


@media (max-width: 768px) {
    .root {
        grid-template-columns: auto;
    }
    .switcher {
        display: none;
    }
    .show {
        display: grid;
    }
}
</style>

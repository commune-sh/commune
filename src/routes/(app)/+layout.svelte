<script lang="ts">
import '../../app.css'
import { 
    PUBLIC_APP_NAME,
    PUBLIC_META_TITLE,
    PUBLIC_META_IMAGE,
    PUBLIC_META_DESCRIPTION,
} from '$env/static/public';

import { page } from '$app/stores';

import { onMount } from 'svelte'
import { browser } from '$app/environment';

import { wellKnownClient, getVersions } from '$lib/matrix/requests'

import { 
    get_local_part,
    cleanDisplayname,
    processURL
} from '$lib/utils/matrix'

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

const room_id = $derived(store.matrix.active_room?.room_id)

$effect(() => {
    if($page) {
        store.matrix.updatePage($page)
    }
    if(browser && !authReady) {
        store.auth.setup({
            authenticated: data?.authenticated,
            access_token: data?.access_token || null,
            user_id: data?.user_id || null,
            device_id: data?.device_id || null,
        })
    }
    if($page.params.room && room_id) {
        const events = store.matrix.events[room_id]
        if(!events) {
            console.log("Fetching room events...")
            store.matrix.fetchRoomMessages({
                room_id: room_id,
            })
        }
    }
})

$effect.pre(() =>{
    if(data) {
        //console.log($state.snapshot(data))
    }
    if(data?.space && store.app.appservice_reachable) {
        prepareSpace()
    }
})

async function setup() {

    try {
        const resp = await wellKnownClient();
        if(resp?.["commune.appservice"]?.url) {
            let url = resp["commune.appservice"].url
            console.log("Found commune appservice:", url)
            store.app.updateAppservice(url)
            store.app.updateAppserviceStatus(true)
        } else {
            store.app.isNativeMode();
        }
    } catch(_) {
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
    store.app.isReady()
    if(!data?.guest_access_token_exists) {
        //store.matrix.registerGuest()
    }

    store.matrix.getFlows()
    if(!data?.native_mode) {
        setup()
    }
})

async function prepareSpace() {
    //store.matrix.addSpace(data.space)
    //store.matrix.getHierarchy(data.space.room_id)
}

let is_home = $derived($page.route.id == '/(app)')
let is_space = $derived($page.params.space != undefined)
let is_room = $derived($page.params.room != undefined)

let active_space = $derived(store.matrix.active_space)
let active_room = $derived(store.matrix.active_room)

let title = $derived.by(() => {
    if(data?.room?.name && data?.space?.name) {
        return `${data.room.name} - ${data.space.name}`
    }
    if(data?.space?.name) {
        return data.space.name
    } else if(data?.space?.canonical_alias) {
        const alias = get_local_part(data.space.canonical_alias)
        return alias
    }
    if(active_room?.name && active_space?.name) {
        return `${active_room.name} - ${active_space.name}`
    }
    if(active_space?.name) {
        return active_space?.name
    }
    return PUBLIC_META_TITLE
})

let image = $derived.by(() => {
    if(data?.sender?.avatar_url) {
        return processURL(data.sender.avatar_url)
    }
    if(data?.room?.avatar_url) {
        return processURL(data.room.avatar_url)
    }
    if(data?.space?.avatar_url) {
        return processURL(data.space.avatar_url)
    }
    return PUBLIC_META_IMAGE
})

let description = $derived.by(() => {
    if(data?.event?.content?.body) {
        return data.event.content.body
    }
    if(data?.room?.topic) {
        return data.room.topic
    }
    if(data?.space?.topic) {
        return data.space.topic
    }
    return PUBLIC_META_DESCRIPTION
})

let author = $derived.by(() => {
    if(data?.sender?.displayname) {
        return cleanDisplayname(data.sender.displayname)
    }
    if(data?.event?.sender) {
        const local = get_local_part(data.event.sender)
        return cleanDisplayname(local)
    }
    return PUBLIC_APP_NAME
})

</script>
<svelte:head>
    <title>{title}</title>
    <meta property="og:title" content={title} />

    <meta property="og:site_name" content={PUBLIC_APP_NAME}>

    <meta property="og:type" content="website" />

    {#if image}
        <meta property="og:image" content={image} />
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="600">
    {/if}
    {#if description}
        <meta name="description" content={description}>
        <meta property="og:description" content={description}>
    {/if}
    {#if author}
        <meta name="author" content={author}>
        <meta property="og:author" content={author}>
    {/if}
</svelte:head>


<Listeners />

<HomeserverDown />

<Matrix {data} />


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

<script lang="ts">
import '../../app.css'
import { 
    PUBLIC_APP_NAME,
    PUBLIC_BASE_URL,
    PUBLIC_META_TITLE,
    PUBLIC_META_IMAGE,
    PUBLIC_META_DESCRIPTION,
    PUBLIC_APPSERVICE
} from '$env/static/public';

import type { Data } from '$lib/commune/types'

import { page } from '$app/state';

import { onMount, type Snippet } from 'svelte'
import { browser } from '$app/environment';

import { wellKnownClient, getVersions } from '$lib/matrix/requests'

import { 
    get_local_part,
    cleanDisplayname,
    processHash
} from '$lib/utils/matrix'

import { 
    downloadMedia
} from '$lib/appservice/requests.svelte'


import Listeners from '$lib/listeners/listeners.svelte'

import Layout from '$lib/layout/layout.svelte'

import HomeserverDown from '$lib/alert/homeserver-down.svelte'

import Matrix from '$lib/matrix/matrix.svelte'
import Settings from '$lib/settings/settings.svelte'
import EventSource from '$lib/event/source.svelte'


// app store
import { createStore } from '$lib/store/store.svelte'
const store = createStore()

let session = $derived.by(() => {
    return store.session?.session
})

// derive credentials from auth store
const credentials = $derived(store.auth.credentials)

let authReady = $derived(store.auth.ready)

let { data, children }: {
    data: Data;
    children: Snippet;
} = $props();

// derive native mode from app store
let native_mode = $derived(store.app.native_mode)

let homeserver_reachable = $derived(data.homeserver_reachable)

const room_id = $derived(store.matrix.active_room?.room_id)

const context_event = $derived.by(() => {
    return page.url.searchParams.get('event')
})


$effect.pre(() => {
    if(page) {
        //store.matrix.updatePage(page)
    }
})

const hash_params = $derived.by(() => {
    return processHash(page.url.hash)
})

const space_param = $derived.by(() => {
    if(page?.params?.space) {
        return page.params.space
    }
    if(page?.url?.hash) {
        return hash_params?.space
    }
})

const room_param = $derived.by(() => {
    if(page?.params?.room) {
        return page.params.room
    }
    if(page?.url?.hash) {
        return hash_params?.room
    }
})


$effect(() => {
    if(browser && !authReady) {
        store.auth.setup({
            authenticated: data?.authenticated,
            access_token: data?.access_token || null,
            user_id: data?.user_id || null,
            device_id: data?.device_id || null,
        })
    }

    if(room_param && room_id && !context_event) {
        const events = store.matrix.events[room_id]
        if(!events) {
            console.log("Fetching room events...")
            store.matrix.fetchRoomMessages({
                room_id: room_id,
            })
        }
    }
    if(room_param && room_id && context_event) {
        console.log("Fetching context event...")
        store.matrix.fetchEventContext({
            room_id: room_id,
            event_id: context_event,
        })
    }
})


$effect.pre(() =>{
    if(data?.space && store.app.appservice_reachable) {
        prepareSpace()
    }
})

async function setup() {

    if(PUBLIC_APPSERVICE) {
        store.app.updateAppservice(PUBLIC_APPSERVICE)
        store.app.updateAppserviceStatus(true)
        return
    }

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

let session_data = $derived.by(() => {
    return data?.session != undefined
})

onMount(async() => {
    await store.oidc.init()
    if(data?.session && !session) {
        store.session.update(data.session, data.oidc_client_id)
    }
    store.app.isReady()
    if(!data?.guest_access_token_exists) {
        //store.matrix.registerGuest()
    }

    await setup()

    if(!data?.native_mode) {
    }

})


async function prepareSpace() {
    //store.matrix.addSpace(data.space)
    //store.matrix.getHierarchy(data.space.room_id)
}

let is_home = $derived(page.route.id == '/(app)')
let is_space = $derived(page.params.space != undefined)
let is_room = $derived(page.params.room != undefined)

let active_space = $derived(store.matrix.active_space)
let active_room = $derived(store.matrix.active_room)

let title = $derived.by(() => {
    if(data?.event?.sender && data?.sender?.displayname) {
        const alias = cleanDisplayname(data.sender.displayname)
        const sender = cleanDisplayname(data.event.sender)
        return `${alias} (${sender})`
    }
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
    if(active_room?.commune_alias && active_space?.canonical_alias) {
        const space_alias = get_local_part(active_space.canonical_alias)
        return `${active_room.commune_alias} - ${space_alias}`
    }
    if(active_space?.name) {
        return active_space?.name
    }
    if(active_space?.canonical_alias) {
        const alias = get_local_part(active_space.canonical_alias)
        return alias
    }
    return PUBLIC_META_TITLE
})

let raw_image = $derived.by(() => {
    if(data?.event?.content?.url) {
        return data?.event.content.url
    }
    if(data?.sender?.avatar_url) {
        return data.sender.avatar_url
    }
    if(data?.room?.avatar_url) {
        return data.room.avatar_url
    }
    if(data?.space?.avatar_url) {
        return data.space.avatar_url
    }
})

let image = $derived.by(async() => {
    if(raw_image) {
        let content_uri = await downloadMedia(raw_image)
        if(content_uri) {
            return content_uri
        }
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

let synced = $derived.by(() => {
    return store.matrix.status.synced
})

</script>
<svelte:head>
    <title>{title}</title>
    <meta property="og:title" content={title} />
    <meta property="twitter:title" content={title} />

    <meta property="og:site_name" content={PUBLIC_APP_NAME}>

    <meta property="og:type" content="website" />
    <meta property="og:url" content={PUBLIC_BASE_URL} />

    {#if image}
        <meta property="og:image" content={image} />
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="600">
        <meta name="twitter:image" content={image} />
        <meta content="summary_large_image" name="twitter:card">
    {/if}
    {#if description}
        <meta name="description" content={description}>
        <meta property="og:description" content={description}>
        <meta property="twitter:description" content={description}>
    {/if}
    {#if author}
        <meta name="author" content={author}>
        <meta property="og:author" content={author}>
    {/if}
</svelte:head>

{#if session_data && !synced}
    <div class="grid place-items-center bg-background z-[1000] fixed top-0 right-0 left-0 bottom-0">
        <div class="spinner spinner-lg">
        </div>
    </div>
{/if}

<Listeners />

<HomeserverDown />

<Matrix {data} />

<EventSource />

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

<script lang="ts">
import '../../app.css'

import { env } from '$env/dynamic/public';

import type { Data } from '$lib/types/common';

import { page } from '$app/state';

import { onMount, type Snippet } from 'svelte'

import { getVersions } from '$lib/matrix/requests'

import { 
    get_local_part,
    cleanDisplayname,
    processHash
} from '$lib/utils/matrix'

import Listeners from '$lib/listeners/listeners.svelte'

import Layout from '$lib/layout/layout.svelte'

import HomeserverDown from '$lib/alert/homeserver-down.svelte'

import State from '$lib/state/state.svelte'
import Settings from '$lib/settings/settings.svelte'
import EventSource from '$lib/event/source.svelte'


// app store
import { createStore } from '$lib/store/store.svelte'
const store = createStore()

let session = $derived.by(() => {
    return store.session?.session
})


let { 
    data, 
    children
}: {
    data: Data,
    children: Snippet
} = $props();

const room_id = $derived(store.matrix.active_room?.room_id)

const context_event = $derived.by(() => {
    return page.url.searchParams.get('event')
})

let metadata = $derived.by(() => {
    return data?.metadata
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

    console.log("DATA is", data)

    if(data.ENV) {
        store.app.init(data.ENV)
    }

    if(room_param && room_id && !context_event) {
        const events = store.matrix.events[room_id]
        if(!events) {
            console.log("Fetching room events...")
            store.matrix.fetchRoomMessages(data.ENV.APPSERVICE_URL,
                data.ENV.HOMESERVER_URL, {
                room_id: room_id,
            })
        }
    }
    if(room_param && room_id && context_event) {
        console.log("Fetching context event...")
        store.matrix.fetchEventContext(data.ENV.APPSERVICE_URL,
            data.ENV.HOMESERVER_URL, {
            room_id: room_id,
            event_id: context_event,
        })
    }
})

let APPSERVICE_URL = $derived(data?.ENV?.APPSERVICE_URL)

async function setup() {

    if(APPSERVICE_URL) {
        store.app.updateAppservice(APPSERVICE_URL)
        console.log("Found commune appservice:", APPSERVICE_URL)
        return
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

    if(data?.session && !session) {
        store.session.update(data.session, data.oidc_client_id)
    }

    store.app.isReady()

    await setup()

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

let PUBLIC_META_TITLE = $derived.by(() => {
    let PUBLIC_META_TITLE = env?.PUBLIC_META_TITLE
    return PUBLIC_META_TITLE ? PUBLIC_META_TITLE : `Commune - Matrix Communities`
})

let title = $derived.by(() => {
    if(metadata?.event?.sender && metadata?.sender?.displayname) {
        const alias = cleanDisplayname(metadata.sender.displayname)
        const sender = cleanDisplayname(metadata.event.sender)
        return `${alias} (${sender})`
    }
    if(metadata?.room?.name && metadata?.space?.name) {
        return `${metadata.room.name} - ${metadata.space.name}`
    }
    if(metadata?.space?.name) {
        return metadata.space.name
    } else if(metadata?.space?.canonical_alias) {
        const alias = get_local_part(metadata.space.canonical_alias)
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


let PUBLIC_META_IMAGE = $derived.by(() => {
    let PUBLIC_META_IMAGE = env?.PUBLIC_META_IMAGE
    if(PUBLIC_META_IMAGE) {
        return PUBLIC_META_IMAGE
    }
    return `https://static.commune.sh/card.png`
})

let image = $derived.by(() => {
    if(data?.metadata?.image) {
        return data?.metadata.image
    }
    return PUBLIC_META_IMAGE
})


let PUBLIC_META_DESCRIPTION = $derived.by(() => {
    let PUBLIC_META_DESCRIPTION = env?.PUBLIC_META_DESCRIPTION
    return PUBLIC_META_DESCRIPTION ? PUBLIC_META_DESCRIPTION : `Matrix-powered
public communities`
})

let description = $derived.by(() => {
    if(metadata?.event?.content?.body) {
        return metadata.event.content.body
    }
    if(metadata?.room?.topic) {
        return metadata.room.topic
    }
    if(metadata?.space?.topic) {
        return metadata.space.topic
    }
    return PUBLIC_META_DESCRIPTION
})

let author = $derived.by(() => {
    if(metadata?.sender?.displayname) {
        return cleanDisplayname(metadata.sender.displayname)
    }
    if(metadata?.event?.sender) {
        const local = get_local_part(metadata.event.sender)
        return cleanDisplayname(local)
    }
    return `Commune`
})

let synced = $derived.by(() => {
    return store.matrix.status.synced
})

</script>
<svelte:head>
    <title>{title}</title>
    <meta property="og:title" content={title} />
    <meta property="twitter:title" content={title} />

    <meta property="og:site_name" content="Commune">

    <meta property="og:type" content="website" />
    <meta property="og:url" content={data.ENV.BASE_URL} />

    {#if image}
        <meta property="og:image" content={image} />

        {#if !data?.metadata?.image}
            <meta property="og:image:width" content="1200">
            <meta property="og:image:height" content="600">
        {/if}

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

<State {data} />

<EventSource {data} />

{#snippet content()}
    {@render children()}
{/snippet}

<Layout {data} {content} />

<Settings />

<style>

</style>

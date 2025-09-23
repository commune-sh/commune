<script lang="ts">
import { page } from '$app/state';
import { onMount } from 'svelte'

import Room from '../room/room.svelte'

import Loading from '../loading/loading.svelte'
import Sidebar from '../sidebar/sidebar.svelte'
import Header from '../header/header.svelte'
import Thread from '../thread/thread.svelte'

import NotFound from '../errors/not-found.svelte'

import { 
    canonical_alias,
    naiveRoomIDCheck,
    isRoomAlias
} from '../utils/matrix'

// app store
import { createStore } from '../store/store.svelte'
const store = createStore()

import type { Data } from '../types/common'
import type { Snippet } from 'svelte';


let {
    data,
    content,
    is_space,
    is_space_child_room,
    non_space_room
}: {
    data: Data,
    content: Snippet,
    is_space: boolean,
    is_space_child_room: boolean,
    non_space_room: boolean
} = $props();

const rooms = $derived.by(() => {
    return store.matrix.rooms
})

let ready = $state(false);

let not_found = $derived.by(() => {
    if(!data.ENV.HOMESERVER_NAME || !page.params.space) {
        return false
    }
    const prefixed = `#${page.params.space}`
    const is_room_alias = isRoomAlias(prefixed)
    if(is_room_alias) {
        return rooms?.length > 0 && 
            rooms?.filter(r => r.canonical_alias == prefixed)[0] == null
    }
    const alias =  canonical_alias(page.params.space, data.ENV.HOMESERVER_NAME)
    return rooms?.length > 0 && 
        rooms?.filter(r => r.canonical_alias == alias)[0]  == null
})

let container;

onMount(() => {
})

const active_space = $derived(store.matrix.active_space)
const active_room = $derived(store.matrix.active_room)

const events = $derived(store.matrix.events[active_room?.room_id]?.events)

const space_state = $derived.by(() => {
    return store.matrix.space_state;
})

$effect(() => {
    if(is_space && is_space_child_room && active_room) {
        if(space_state && events) {
            ready = true
        }
    }
    if(is_space && !is_space_child_room) {
        if(space_state) {
            ready = true
        }
    }
    if(non_space_room && active_room) {
        if(events) {
            ready = true
        }
    } else if(non_space_room) {
        ready = true
    }
})


const thread_exists = $derived.by(() => {
    return page.url.searchParams.get('thread') != undefined
})

const menu_active = $derived(store.ui.menu_active)

let viewport;

function clickThrough() {
    if(menu_active) {
        store.ui.toggleMenu()
    }
}

</script>


{#if !ready}
    <div class="overlay-loading">
        <Loading />
    </div>
{/if}

{#if not_found && is_space}
    <NotFound />
{:else}
<div class="view-root grid grid-cols-[auto_1fr]" 
    class:has-thread={thread_exists}
    class:menu-active={menu_active}
    bind:this={container}>

    <div class="sidebar-container relative bg-sidebar grid">
        <Sidebar
            {data}
            {is_space}
            {is_space_child_room}
            {non_space_room}
        />
    </div>

    <div class="view bg-view grid grid-rows-[52px_1fr] h-dvh"
        class:full-width={menu_active}>
        <Header 
            {data}
            {is_space}
            {is_space_child_room}
            {non_space_room}
            />
        <section class="view select-text overflow-hidden"
            onclick={clickThrough}
            bind:this={viewport}
            class:mask-view={menu_active}>
                <Room
                    {data}
                    {is_space}
                    {is_space_child_room}
                    {non_space_room}
                />
        </section>
    </div>
    {#if thread_exists}
        <Thread {data} />
    {/if}

</div>
{/if}


<style>
.overlay-loading {
    z-index: 2;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--view);
}

.sidebar-container {
    border-radius: 20px 0 0 0;
}
.has-thread {
    grid-template-columns: auto 1fr auto;
}
@media (max-width: 768px) {
    .view-root {
        grid-template-columns: 1fr;
    }
    .sidebar-container {
        display: none;
    }
    .has-thread {
        grid-template-columns: 1fr auto;
    }
}

.menu-active {
    grid-template-columns: auto 1fr;
}

.menu-active .sidebar-container {
    display: grid;
}

.full-width {
    width: 100dvw;
}
.mask-view {
    opacity: 0.5;
}
</style>


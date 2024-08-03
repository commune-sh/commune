<script>
import { PUBLIC_META_TITLE } from '$env/static/public';
import { page } from '$app/stores';
import { onMount } from 'svelte'

import Loading from '$lib/loading/loading.svelte'
import Sidebar from '$lib/sidebar/sidebar.svelte'
import Header from '$lib/header/header.svelte'
import Thread from '$lib/thread/thread.svelte'

import NotFound from '$lib/errors/not-found.svelte'

import { 
    canonical_alias,
    naiveRoomIDCheck,
} from '$lib/utils/matrix'

// app store
import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()


let {
    data,
    content
} = $props();

const rooms = $derived.by(() => {
    return store.matrix.rooms
})

let ready = $state(false);

let is_space = $derived($page.params.space != undefined)
let is_room = $derived($page.params.room != undefined)

let not_found = $derived.by(() => {
    const is_room_id = naiveRoomIDCheck($page.params.space)
    if(is_room_id) {
        return rooms?.length > 0 && 
            rooms?.filter(r => r.room_id == $page.params.space)[0] == null
    }
    const alias =  canonical_alias($page.params.space)
    return rooms?.length > 0 && 
        rooms?.filter(r => r.canonical_alias == alias)[0]  == null
})

let container;

onMount(() => {
})

const active_space = $derived(store.matrix.active_space)
const active_room = $derived(store.matrix.active_room)

const room = $derived(store.matrix.active_room)

const events = $derived(store.matrix.events[room?.room_id]?.events)
const space_state = $derived.by(() => {
    return store.matrix.room_state[active_space?.room_id]
})

$effect(() => {
    if(is_space && is_room && room) {
        if(space_state && events) {
            ready = true
        }
    }
    if(is_space && !is_room) {
        if(space_state) {
            ready = true
        }
    }
})


const thread_exists = $derived.by(() => {
    return $page.params.thread != undefined
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
        <Sidebar />
    </div>

    <div class="view bg-view grid grid-rows-[52px_1fr] h-dvh"
        class:full-width={menu_active}>
        <Header />
        <section class="view select-text overflow-hidden"
            onclick={clickThrough}
            bind:this={viewport}
            class:mask-view={menu_active}>
                {@render content()}
        </section>
    </div>
    {#if thread_exists}
        <Thread />
    {/if}

</div>
{/if}


<style>
.overlay-loading {
    z-index: 1000;
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


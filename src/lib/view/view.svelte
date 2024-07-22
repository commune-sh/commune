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

$effect(() => {
    if(is_space && is_room && room) {
        const messages = store.matrix.messages[room?.room_id]?.events
        if(messages) {
            ready = true
        }
    }
    if(is_space && !is_room) {
        ready = true
    }
})


const thread_exists = $derived.by(() => {
    return $page.params.thread != undefined
})

const menu_active = $derived(store.ui.menu_active)

</script>

{#if !ready}
    <Loading />
{:else if not_found && is_space}
    <NotFound />
{:else}
<div class="view-root grid grid-cols-[auto_1fr]" 
    class:has-thread={thread_exists}
    class:menu-active={menu_active}
    bind:this={container}>

    <div class="sidebar-container relative bg-sidebar grid">
        <Sidebar />
    </div>

    <div class="view bg-view grid grid-rows-[52px_1fr] h-dvh">
        <Header />
        <section class="view select-text overflow-hidden">
            {@render content()}
        </section>
    </div>
    {#if thread_exists}
        <Thread />
    {/if}

</div>
{/if}


<style>

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
</style>


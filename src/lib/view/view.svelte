<script>
import { PUBLIC_META_TITLE } from '$env/static/public';
import { page } from '$app/stores';
import { onMount } from 'svelte'

import Loading from '$lib/loading/loading.svelte'
import Sidebar from '$lib/sidebar/sidebar.svelte'
import Header from '$lib/header/header.svelte'
import Thread from '$lib/thread/thread.svelte'

// app store
import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()


let {
    data,
    content
} = $props();

$effect(() => {
    if(data) {
    }
})

const rooms = $derived.by(() => {
    return store.matrix.rooms
})

let ready = $derived(rooms?.length > 0);

let container;

onMount(() => {
})

const thread_exists = $derived.by(() => {
    return $page.params.thread != undefined
})

const menu_active = $derived(store.ui.menu_active)

</script>

{#if !ready}
    <Loading />
{:else}
<div class="view-root grid grid-cols-[auto_1fr]" 
    class:has-thread={thread_exists}
    class:menu-active={menu_active}
    bind:this={container}>

    <div class="sidebar-container relative bg-sidebar grid">
        <Sidebar />
    </div>

    <div class="view bg-view grid grid-rows-[52px_1fr] h-full">
        <Header />
        <section class="view select-text">
            {@render content()}
        </section>
    </div>
    {#if thread_exists}
        <Thread />
    {/if}

</div>
{/if}


<style>
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


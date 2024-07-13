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

let ready = $state(false);

let container;

onMount(() => {
    setTimeout(() => {
        ready = true;
    }, 1000)
})

const thread_exists = $derived.by(() => {
    return $page.params.thread != undefined
})

</script>

{#if !ready}
    <Loading />
{:else}
<div class="grid grid-cols-[auto_1fr]" 
    class:has-thread={thread_exists}
    bind:this={container}>

    <Sidebar />

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
</style>


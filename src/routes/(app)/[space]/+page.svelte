<script>
import { PUBLIC_META_TITLE } from '$env/static/public';
import { page } from '$app/stores';

import Sidebar from '$lib/sidebar/sidebar.svelte'
import Header from '$lib/header/header.svelte'

// app store
import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()


let {
    data,
} = $props();

$effect(() => {
    if(data) {
        console.log(data)
    }
})

let container;

let title = $derived.by(() => {
    if(data?.space != undefined && data?.space?.name != "")  {
        return `${data?.space?.name} - ${PUBLIC_META_TITLE}`
    } 
    return PUBLIC_META_TITLE
})

</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>


<div class="grid grid-cols-[232px_1fr]" bind:this={container}>

    <div class="sidebar bg-sidebar grid">
        <Sidebar />
    </div>

    <div class="view bg-view grid grid-rows-[52px_1fr] h-full">
        <Header />
        <section class="view select-text">
            {$page.params.space}
            {#await data.space}
            {/await}
        </section>
    </div>

</div>


<style>
</style>

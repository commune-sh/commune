<script>
import { page } from '$app/stores';

import Sidebar from '$lib/sidebar/sidebar.svelte'
import Header from '$lib/header/header.svelte'

// app store
import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let container;

</script>


<div class="container grid grid-cols-[232px_1fr]" 
    bind:this={container}>

    <div class="sidebar grid">
        <Sidebar />
    </div>

    <div class="view grid grid-rows-[52px_1fr] bg-view h-full">
        <Header />
        <section class="view select-text">
            {$page.params.space}
        </section>
    </div>

</div>


<style>
</style>

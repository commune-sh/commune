<script lang="ts">
import Toggle from '../theme/toggle.svelte'
import { onMount, tick } from 'svelte'

import Sidebar from '../sidebar/sidebar.svelte'
import Header from '../header/header.svelte'

import type { Data } from '../types/common'

let {
    data,
}: {
    data: Data,
} = $props();

import { createStore } from '../store/store.svelte'
const store = createStore()

const client = $derived(store.matrix.client)
const synced = $derived(store.matrix.synced)

const rooms = $derived(client?.store?.rooms)

const menu_active = $derived(store.ui.menu_active)

let events = $state([])

let viewport;

let container;

$effect(() => {
    if(synced && client?.store) {
    }
})

</script>



<div class="grid grid-cols-[auto_1fr]" class:con={!menu_active}
    bind:this={container}
class:menu-active={menu_active}>

    <Sidebar {data} />

    <div class="view bg-view grid grid-rows-[52px_1fr] h-full">
        <Header {data} />
        <section class="view select-text">
            home
        </section>
    </div>

</div>


<style>
.menu-active {
    grid-template-columns: 232px 1fr;
}
@media (max-width: 768px) {
    .con {
        grid-template-columns: auto;
    }
    .sidebar {
        display: none;
    }
    .show {
        display: grid;
    }
}
</style>

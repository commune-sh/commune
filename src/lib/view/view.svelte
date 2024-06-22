<script lang="ts">
import Toggle from '$lib/theme/toggle.svelte'
import { onMount, tick } from 'svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const client = $derived(store.matrix.client)
const synced = $derived(store.matrix.synced)

const rooms = $derived(client?.store?.rooms)


let events = $state([])

let viewport;

$effect(() => {
    if(synced && client?.store) {
    }
})

</script>


<div class="overflow-hidden max-h-full">
    <div class="p-8 overflow-y-auto h-full" bind:this={viewport}>
    </div>
</div>

<style>
</style>


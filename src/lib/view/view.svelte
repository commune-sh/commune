<script lang="ts">
import Toggle from '$lib/theme/toggle.svelte'
import { onMount, tick } from 'svelte'

// matrix store
import { createMatrixStore } from '$lib/store/matrix.svelte.js'
const matrixStore = createMatrixStore()

const client = $derived(matrixStore.client)
const synced = $derived(matrixStore.synced)

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


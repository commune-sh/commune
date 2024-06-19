<script lang="ts">
import Toggle from '$lib/theme/toggle.svelte'
import { onMount, tick } from 'svelte'

// UI store
import { createMatrixStore } from '$lib/store/matrix.svelte.js'
const matrixStore = createMatrixStore()


let events = $state([])

let viewport;


</script>


<div class="overflow-hidden max-h-full">
    <div class="p-8 overflow-y-auto h-full" bind:this={viewport}>
    </div>
</div>

<style>
</style>


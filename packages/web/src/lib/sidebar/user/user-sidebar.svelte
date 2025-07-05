<script lang="ts">
import type { Data } from '$lib/types/common'

let {
    data,
}: {
    data: Data,
} = $props();


import { createStore } from '$lib/store/store.svelte'
const store = createStore()

const rooms = $derived.by(() => {
    return store.matrix.rooms
})
</script>


<script lang="ts">
import type { Data } from '../../types/common'

let {
    data,
}: {
    data: Data,
} = $props();


import { createStore } from '../../store/store.svelte'
const store = createStore()

const rooms = $derived.by(() => {
    return store.matrix.rooms
})
</script>


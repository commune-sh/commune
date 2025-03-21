<script>
import { createStore } from '$lib/store/store.svelte'
const store = createStore()

const rooms = $derived.by(() => {
    return store.matrix.rooms
})
</script>


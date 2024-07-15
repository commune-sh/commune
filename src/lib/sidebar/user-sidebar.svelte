<script>
import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const rooms = $derived.by(() => {
    return store.matrix.rooms
})
</script>
ok

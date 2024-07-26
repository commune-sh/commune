<script>
import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    sender
} = $props();

const room_state = $derived(store.matrix.room_state)
const room = $derived(store.matrix.active_room)
const state = $derived.by(() => {
    return room_state[room?.room_id]
})

const user = $derived.by(() => {
    return state?.find(x => x.state_key === sender)
})

const displayname = $derived.by(() => {
    return user?.content?.displayname
})

</script>

<span class="sender font-semibold">
    {displayname}
</span>

<style>
</style>

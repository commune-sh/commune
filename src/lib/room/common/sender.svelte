<script>
import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    event
} = $props();

const state = $derived(store.matrix.active_room_state)

const user = $derived.by(() => {
    return state?.find(x => x.state_key === event?.sender)
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

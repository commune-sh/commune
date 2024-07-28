<script>
import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

import { aliasFromSender } from '$lib/utils/matrix';

let {
    event
} = $props();

const state = $derived(store.matrix.active_room_state)

const user = $derived.by(() => {
    return state?.find(x => x.state_key === event?.sender)
})

const sender = $derived(event?.sender)

const displayname = $derived.by(() => {
    return user?.content?.displayname
})

const name = $derived(displayname ? displayname : aliasFromSender(sender))

</script>

<span class="sender font-semibold">
    {name}
</span>

<style>
</style>

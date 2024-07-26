<script>
import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    event,
} = $props();

const state = $derived(store.matrix.active_room_state)

const user = $derived.by(() => {
    return state?.find(x => x.state_key === event?.sender)
})

const displayname = $derived.by(() => {
    return user?.content?.displayname
})

const joined = $derived.by(() => {
    return event?.content?.membership == 'join' && 
        !event?.['prev_content'] && 
        !event?.['replaces_state']
})

</script>

<div class="text-xs justify-center">
    <span>
    {#if joined}
        {displayname} joined the room
    {/if}
    </span>
</div>

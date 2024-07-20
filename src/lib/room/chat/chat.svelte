<script>
import { page } from '$app/stores';

import Loading from '$lib/loading/loading.svelte'

import { 
    naiveRoomIDCheck
} from '$lib/utils/matrix'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const rooms = $derived(store.matrix.rooms)
const room_state = $derived(store.matrix.room_state)

const room = $derived.by(() => {
    const is_room_id = naiveRoomIDCheck($page.params.room)
    const key = is_room_id ? `room_id` : `origin_server_ts`
    return rooms?.filter(r => r[key] == $page.params.room)[0]
})

const state = $derived.by(() => {
    return room_state[room?.room_id]
})

const messages = $derived.by(() => {
    return store.matrix.messages[room?.room_id]?.events
})

$effect(() => {
})

</script>

{#if messages}
<div class="h-full overflow-y-auto overflow-x-hidden">
    <div class="m-4">
        {#each messages as message, event_id (message.event_id)}
            <div class="mb-4">
                {JSON.stringify(message)}
            </div>
        {/each}
    </div>
</div>
{:else}
    <Loading />
{/if}


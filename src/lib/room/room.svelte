<script>
import { page } from '$app/stores';

import { 
    canonical_alias,
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

</script>

{JSON.stringify(state)}

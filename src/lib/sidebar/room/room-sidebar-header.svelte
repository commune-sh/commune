<script>
import { page } from '$app/stores';
import { naiveRoomIDCheck, canonical_alias, get_local_part } from '$lib/utils/matrix'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const rooms = $derived.by(() => {
    return store.matrix.rooms
})

const is_alias = $derived.by(() => {
    return !naiveRoomIDCheck($page.params.space)
})

const room = $derived.by(() => {
    if(is_alias) {
        const alias = canonical_alias($page.params.space)
        return rooms?.find(room => room.canonical_alias == alias)
    }
    return rooms?.find(room => room.room_id == $page.params.space)
})

const name = $derived.by(() => {
    if(room?.name) {
        return room.name
    }
    if(room?.canonical_alias) {
        return get_local_part(room.canonical_alias)
    }
    return room?.room_id
})

</script>

<div class="sidebar-header grid 
    bg-header border-solid border-b border-border">
    <div class="grid grid-cols-[auto_1fr_auto] mx-4 items-center justify-items-start">
        <div class="font-semibold">
            {name}
        </div>
        <div class="">
        </div>
        <div class="">
        </div>
    </div>
</div>

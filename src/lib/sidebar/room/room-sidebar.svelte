<script>
import { page } from '$app/stores';
import { naiveRoomIDCheck, canonical_alias } from '$lib/utils/matrix'
import { strayRooms } from '$lib/utils/matrix'

import RoomItems from '$lib/sidebar/room/room-items.svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let is_rooms = $derived($page.route.id?.includes('/(app)/rooms'))

const space_rooms = $derived(store.matrix.space_rooms)

let stray_rooms = $derived.by(() => {
    return store.matrix.rooms ? strayRooms(store.matrix.rooms) : null
})

let items = $derived.by(() => {
    return is_rooms ? stray_rooms : space_rooms
})


</script>

<div class="sidebar-container">

    <RoomItems {items} />

</div>


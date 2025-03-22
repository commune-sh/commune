<script>
import { page } from '$app/state';
import { naiveRoomIDCheck, canonical_alias } from '$lib/utils/matrix'
import { 
    strayRooms,
    processHash
} from '$lib/utils/matrix'

import RoomItems from '$lib/sidebar/room/room-items.svelte'

import { createStore } from '$lib/store/store.svelte'
const store = createStore()

const rooms = $derived.by(() => {
    return store.matrix.rooms
})

const hash_params = $derived.by(() => {
    return processHash(page.url.hash)
})

const space_param = $derived.by(() => {
    if(page?.params?.space) {
        return page.params.space
    }
    if(page?.url?.hash) {
        return hash_params?.space
    }
})

const is_alias = $derived.by(() => {
    return !naiveRoomIDCheck(space_param)
})

let non_space_room = $derived(page.route.id?.includes('/(app)/rooms'))

const space_rooms = $derived.by(() => {
    let key = is_alias ? 'canonical_alias' : 'room_id'
    let val = is_alias ? canonical_alias(space_param) : space_param

    let i = rooms?.filter(room => room[key] == val)[0]
    if(i?.children?.length > 0) {
        let items = []
        i.children.forEach(child => {
            let item = rooms?.find(room => room.room_id == child)
            if(item?.room_id && !item?.children) {
                items.push(item)
            }
        })
        return items
    }
})


let stray_rooms = $derived.by(() => {
    return store.matrix.rooms ? strayRooms(store.matrix.rooms) : null
})

let items = $derived.by(() => {
    return non_space_room ? stray_rooms : space_rooms
})


</script>

<div class="sidebar-container">

    <RoomItems {items} />

</div>


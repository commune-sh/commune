<script lang="ts">
import { page } from '$app/state';
import { naiveRoomIDCheck, canonical_alias } from '../../utils/matrix'
import { 
    strayRooms,
    processHash
} from '../../utils/matrix'

import RoomItems from '../room/room-items.svelte'

import type { Data } from '../../types/common'

let {
    data,
}: {
    data: Data,
} = $props();

import { createStore } from '../../store/store.svelte'
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

const not_local_space = $derived.by(() => {
    if(!space_param) {
        return false
    }
    return space_param.includes(':')
})

let non_space_room = $derived(page.route.id?.includes('/(app)/rooms'))

const space_rooms = $derived.by(() => {
    if(!data.ENV.HOMESERVER_NAME || !page.params.space) {
        return null
    }

    let key = is_alias ? 'canonical_alias' : 'room_id'
    let val = is_alias ? canonical_alias(space_param, data.ENV.HOMESERVER_NAME) : space_param

    if(not_local_space) {
        key = `canonical_alias`
        val = `#${space_param}`
    }

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


const _space_rooms = $derived.by(() => {
    return store.matrix.store.space_rooms.get(page.params.space)
});

</script>

<div class="sidebar-container">

    <RoomItems {data} {items} />

</div>


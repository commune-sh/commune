<script lang="ts">
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { 
    is_local_room, 
    get_local_part,
    get_domain,
    aliasFromName
} from '../../utils/matrix'

import { 
    hash,
    chatBubble,
    ellipsis
} from '../../assets/icons'

import type { Data } from '../../types/common'

import { debounce } from '../../utils/utils'

import { createStore } from '../../store/store.svelte'
const store = createStore()

const authenticated = $derived(store.session.authenticated)

const menu_active = $derived(store.ui.menu_active)

let {
    data,
    item,
    index
}: {
    data: Data,
    item: any,
    index: number
} = $props();

const is_local = $derived.by(() => {
    return is_local_room(item?.room_id, data.ENV.HOMESERVER_NAME)
})

const alias_or_id = $derived(item?.commune_alias ? item?.commune_alias :
    item?.room_id)


const path = $derived.by(() => {
    // non space rooms

    if(non_space_room) {
        if(page.url.search != '') {
            return `/rooms/${alias_or_id}${page.url.search}`
        }
        return `/rooms/${alias_or_id}`
    }

    // space rooms

    let is_event = page.url.searchParams.get('event') != null

    if(page.url.search != '' && !is_event) {
        return `/${page.params.space}/${alias_or_id}${page.url.search}`
    }

    return `/${page.params.space}/${alias_or_id}`
})

let non_space_room = $derived(page.route.id?.includes('/(app)/rooms'))

function goToRoom() {
    //getState()
    goto(path)
    const location = non_space_room ? 'rooms' : page.params.space
    store.ui.updateRoute(location, path)
    if(menu_active) store.ui.toggleMenu()
}

function handleEnterRoom(e: KeyboardEvent) {
    if(e.key === 'Enter') {
        e.preventDefault()
        goToRoom()
    }
}

const active_room = $derived(store.matrix.active_room)

const active = $derived.by(() => {
    return page.params.room && active_room && item?.room_id == active_room?.room_id
})

function log(e) {
    e.preventDefault()
    console.log(item)
}


$effect(() => {
    if(active && item?.room_id && !authenticated && data.ENV.APPSERVICE_URL) {
        store.matrix.fetchRoomState(item.room_id, data.ENV.APPSERVICE_URL)
    }
})

function getState() {
    if(item?.room_id && !authenticated && data.ENV.APPSERVICE_URL) {
        store.matrix.fetchRoomState(item.room_id, data.ENV.APPSERVICE_URL)
    }
}

let hovered = $state(false);

function startHover() {
    hovered = true
    debounce(() => {
        if(hovered) {
            //getState()
        }
    }, 300)
}
function stopHover() {
    hovered = false
}

onMount(() => {
    if(active) {
        store.ui.updateRoute(page.params.space, path)
    }

    let saved_route = store.ui.getSavedRoute(page.params.space)

    if(saved_route && !page.params.room) {
        let path = `/${page.params.space}/${item.commune_alias}`
        if(path == saved_route) {
            goToRoom()
            return
        }
    }

    if(index == 0 && !page.params.room && !saved_route) {
        // if this is the first item and no room is active, go to this room
        goToRoom()
    }
})

const title = $derived.by(() => {
    if(item?.commune_alias) {
        return item.commune_alias
    }
    if(item?.name) {
        return item.name
    }
    if(item?.canonical_alias) {
        return get_local_part(item.canonical_alias)
    }
    return `Untitled Room`
})

const is_forum = $derived.by(() => {
    return item?.type == "forum"
})

const room_icon = $derived.by(() => {
    return is_forum ? chatBubble : hash
})

const domain = $derived.by(() => {
    return get_domain(item?.canonical_alias)
})

const show_domain = $derived.by(() => {
    return !is_local && non_space_room
})

function openMenu(e: MouseEvent | KeyboardEvent) {
    e.stopPropagation()
    console.log("opening menu")
}

function openMenuEnter(e: KeyboardEvent) {
    if(e.key === 'Enter') {
        e.preventDefault()
        openMenu(e)
    }
}

const room_state = $derived.by(() => {
    return store.matrix.store.room_state.get(item?.room_id)
})

const origin_server_ts = $derived.by(() => {
    return room_state?.get('m.room.create')?.origin_server_ts;
})

// HAIRY code, fix this later
const slug = $derived.by(() => {
    // make a slug from the room name (lowercase, spaces to dashes, remove special characters)
    let _slug = aliasFromName(item.name)

    // get all rooms in this space
    let space_rooms = store.matrix.store.space_rooms.get(page.params.space)
    // find all rooms with the same name
    let same_name = space_rooms?.filter((r: any) => r.name == item.name)

    // if there are no other rooms with the same name, return the slug
    if(!same_name || same_name?.length == 1) {
        return _slug
    }

    let all_origin_server_ts: Array<number> = [];

    same_name.forEach((r: any) => {
        let state = store.matrix.store.room_state.get(r.room_id)
        let ts = state?.find((s: any) => s.type == 'm.room.create')?.origin_server_ts
        if(ts) {
            all_origin_server_ts.push(ts)
        }
    })

    // sort the timestamps
    all_origin_server_ts.sort((a: number, b: number) => a - b)

    if(all_origin_server_ts[0] == origin_server_ts) {
        return _slug
    }

    return `${_slug}-${origin_server_ts}`
})

</script>

<div class="room-item cursor-pointer text-light hover:text-text
    mx-2 my-[2px]"
    class:active={active}
    role="button"
    tabindex="0"
    onmouseover={startHover}
    onfocus={startHover}
    onmouseout={stopHover}
    onblur={stopHover}
    onclick={goToRoom} 
    onkeypress={handleEnterRoom} 
    oncontextmenu={log}>
    <div class="item grid grid-cols-[auto_1fr_auto]">
        <div class="pl-2">
            <div class="r-i h-[16px] w-[16px] h-full grid items-center">
                {@html room_icon}
            </div>
        </div>
        <div class="room-name ml-2 font-normal truncate py-2">
            {title} 
        </div>

        <div class="menu mx-2 grid items-center"
                role="button"
                tabindex="0"
                onclick={openMenu}
                onkeypress={openMenuEnter}>
            <div class="r-i h-[20px] w-[20px]">
                {@html ellipsis}
            </div>
        </div>
    </div>

    {#if show_domain}
        <div class="alias pb-2 text-xs text-light">
            {domain}
        </div>
    {/if}

</div>

<style>
.active {
    color: var(--text);
    background: var(--cmn-2);
}

.room-item {
    border-radius: 4px;
}
.room-item:hover {
    background: var(--cmn-2);
}
.active:hover {
    background: var(--cmn-3);
}

.room-name {
    line-height: 1.3;
}

.r-i {
    fill: var(--light);
}

.alias {
    margin-left: calc(16px + 1rem);
}

.menu {
    display: none;
}

.room-item:hover .menu {
    display: grid;
}

</style>

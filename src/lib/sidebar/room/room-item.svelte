<script>
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { is_local_room, get_local_part } from '$lib/utils/matrix'

import { hash } from '$lib/assets/icons'

import { debounce } from '$lib/utils/utils'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const authReady = $derived(store.auth.ready)
const authenticated = $derived(store.auth.authenticated)

const menu_active = $derived(store.ui.menu_active)

let {
    item
} = $props();

function log(e) {
    e.preventDefault()
    console.log(item)
}

const is_local = $derived.by(() => {
    return is_local_room(item?.room_id)
})

const alias_or_id = $derived(item?.commune_alias ? item?.commune_alias :
    item?.room_id)

//const path = $derived(`/${$page.params.space}/${alias_or_id}`)
const path = $derived.by(() => {
    if(is_rooms) {
        return `/rooms/${alias_or_id}`
    }
    return `/${$page.params.space}/${alias_or_id}`
})

let is_rooms = $derived($page.route.id?.includes('/(app)/rooms'))

function goToRoom() {
    goto(path)
    const location = is_rooms ? 'rooms' : $page.params.space
    store.ui.updateRoute(location, path)
    if(menu_active) store.ui.toggleMenu()
}

const active_room = $derived(store.matrix.active_room)


const active = $derived.by(() => {
    return $page.params.room && active_room && item?.room_id == active_room?.room_id
})

$effect(() => {
    if(active && item?.room_id && authReady && !authenticated) {
        store.matrix.fetchRoomState(item.room_id)
    }
    if(active) {
        const stored = localStorage.getItem('navigation')
        if(!stored) {
            const nav = new Map()
            nav.set($page.params.space, path)
            const s = Array.from(nav.entries());
            localStorage.setItem('navigation', JSON.stringify(s))
        } else {
            const s = JSON.parse(localStorage.getItem('navigation'));
            const nav = new Map(s);
            nav.set($page.params.space, path)
            localStorage.setItem('navigation', JSON.stringify(Array.from(nav.entries())))
        }
    }
})

function getState() {
    if(item?.room_id && authReady && !authenticated) {
        store.matrix.fetchRoomState(item.room_id)
    }
}

let hovered = $state(false);

function startHover() {
    hovered = true
    debounce(() => {
        if(hovered) {
            getState()
        }
    }, 300)
}
function stopHover() {
    hovered = false
}

onMount(() => {
    if(active) {
        store.ui.updateRoute($page.params.space, path)
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

</script>

<div class="room-item cursor-pointer text-light hover:text-text
    mx-2 my-[2px] p-2"
    class:active={active}
    onmouseover={startHover}
    onmouseout={stopHover}
    onmousedown={getState}
    onclick={goToRoom} oncontextmenu={log}>
    <div class="item grid grid-cols-[auto_1fr]">
        <div class="">
            <div class="r-i h-[16px] w-[16px] h-full grid items-center">
                {@html hash}
            </div>
        </div>
        <div class="room-name ml-2 font-normal truncate">
            {title} 
        </div>
    </div>
</div>

<style>
.active {
    color: var(--text);
    background: var(--shade-3);
}

.room-item {
    border-radius: 4px;
}
.room-item:hover {
    background: var(--shade-2);
}
.active:hover {
    background: var(--shade-3);
}

.room-name {
    line-height: 1.3;
}

.r-i {
    fill: var(--light);
}

</style>

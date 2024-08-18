<script>
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { 
    is_local_room, 
    get_local_part,
    get_domain,
    processHash,
} from '$lib/utils/matrix'

import { 
    hash,
    ellipsis
} from '$lib/assets/icons'

import { debounce } from '$lib/utils/utils'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const authReady = $derived(store.auth.ready)
const authenticated = $derived(store.auth.authenticated)

const menu_active = $derived(store.ui.menu_active)

let {
    item
} = $props();

const is_local = $derived.by(() => {
    return is_local_room(item?.room_id)
})

const alias_or_id = $derived(item?.commune_alias ? item?.commune_alias :
    item?.room_id)

const hash_params = $derived.by(() => {
    return processHash($page.url.hash)
})

const space_param = $derived.by(() => {
    if($page?.params?.space) {
        return $page.params.space
    }
    if($page?.url?.hash) {
        return hash_params?.space
    }
})

const room_param = $derived.by(() => {
    if($page?.params?.room) {
        return $page.params.room
    }
    if($page?.url?.hash) {
        return hash_params?.room
    }
})

//const path = $derived(`/${$page.params.space}/${alias_or_id}`)
const path = $derived.by(() => {
    // non space rooms

    if(non_space_room) {
        if($page.url.search != '') {
            return `/rooms/${alias_or_id}${$page.url.search}`
        }
        return `/rooms/${alias_or_id}`
    }

    // space rooms

    if($page.url.search != '') {
        return `/${space_param}/${alias_or_id}${$page.url.search}`
    }

    return `/${space_param}/${alias_or_id}`
})

let non_space_room = $derived($page.route.id?.includes('/(app)/rooms'))

function goToRoom() {
    getState()
    goto(path)
    const location = non_space_room ? 'rooms' : $page.params.space
    store.ui.updateRoute(location, path)
    if(menu_active) store.ui.toggleMenu()
}

const active_room = $derived(store.matrix.active_room)

const active = $derived.by(() => {
    return room_param && active_room && item?.room_id == active_room?.room_id
})

function log(e) {
    e.preventDefault()
    console.log(active_room?.room_id, item?.room_id)
}


$effect(() => {
    if(active && item?.room_id && authReady && !authenticated) {
        store.matrix.fetchRoomState(item.room_id)
    }
    if(active) {
        const stored = localStorage.getItem('navigation')
        if(!stored) {
            const nav = new Map()
            nav.set(space_param, path)
            const s = Array.from(nav.entries());
            localStorage.setItem('navigation', JSON.stringify(s))
        } else {
            const s = JSON.parse(localStorage.getItem('navigation'));
            const nav = new Map(s);
            nav.set(space_param, path)
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
            //getState()
        }
    }, 300)
}
function stopHover() {
    hovered = false
}

onMount(() => {
    if(active) {
        store.ui.updateRoute(space_param, path)
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

const domain = $derived.by(() => {
    return get_domain(item?.canonical_alias)
})

const show_domain = $derived.by(() => {
    return !is_local && non_space_room
})

function openMenu(e) {
    e.stopPropagation()
    console.log("opening menu")
}

</script>

<div class="room-item cursor-pointer text-light hover:text-text
    mx-2 my-[2px]"
    class:active={active}
    onmouseover={startHover}
    onmouseout={stopHover}
    onclick={goToRoom} oncontextmenu={log}>
    <div class="item grid grid-cols-[auto_1fr_auto]">
        <div class="pl-2">
            <div class="r-i h-[16px] w-[16px] h-full grid items-center">
                {@html hash}
            </div>
        </div>
        <div class="room-name ml-2 font-normal truncate py-2">
            {title} 
        </div>

        <div class="menu mx-2 grid items-center"
                onclick={openMenu}>
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
    background: var(--shade-2);
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

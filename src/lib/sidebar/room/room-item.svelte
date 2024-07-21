<script>
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { is_local_room, get_local_part } from '$lib/utils/matrix'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const authReady = $derived(store.auth.ready)
const authenticated = $derived(store.auth.authenticated)

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

const alias_or_ots = $derived(item?.commune_alias ? item?.commune_alias :
    item?.origin_server_ts)

const path = $derived(`/${$page.params.space}/${alias_or_ots}`)

function goToRoom() {
    goto(path)
    store.ui.updateRoute($page.params.space, path)
}

import { 
    naiveRoomIDCheck,
    naiveOSTCheck
} from '$lib/utils/matrix'

const key = $derived.by(() => {
    const is_room_id = naiveRoomIDCheck($page.params.room)
    const is_origin_server_ts = naiveOSTCheck($page.params.room)
    const is_commune_alias = !naiveOSTCheck($page.params.room)
    return is_room_id ? `room_id` : is_origin_server_ts ?
    `origin_server_ts` : is_commune_alias ? `commune_alias` : ``
})
const active = $derived.by(() => {
    return item?.[key] == $page.params.room
})

$effect(() => {
    if(active && item?.room_id && authReady && !authenticated) {
        const state = store.matrix.room_state[item.room_id]
        if(!state) {
            store.matrix.fetchRoomState(item.room_id)
        }
    }
})

function getState() {
    if(item?.room_id && authReady && !authenticated) {
        const state = store.matrix.room_state[item.room_id]
        if(!state) {
            store.matrix.fetchRoomState(item.room_id)
        }
    }
}

onMount(() => {
    if(active) {
        store.ui.updateRoute($page.params.space, path)
    }
})

const title = $derived.by(() => {
    if(item?.name) {
        return item.name
    }
    if(item?.canonical_alias) {
        return get_local_part(item.canonical_alias)
    }
    return `Untitled Room`
})

</script>

<div class="room-item cursor-pointer text-light mx-2 my-[2px] p-2"
    class:active={active}
    onmousedown={getState}
    onclick={goToRoom} oncontextmenu={log}>
    <div class="">
        {title}
    </div>
</div>

<style>
.active {
    color: var(--text);
    background: var(--shade-3);
}

.room-item {
    font-size: 0.9rem;
    border-radius: 4px;
}
.room-item:hover {
    background: var(--shade-2);
}
.active:hover {
    background: var(--shade-3);
}

</style>

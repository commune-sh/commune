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

const alias_or_id = $derived(item?.commune_alias ? item?.commune_alias :
    item?.room_id)

const path = $derived(`/${$page.params.space}/${alias_or_id}`)

function goToRoom() {
    goto(path)
    store.ui.updateRoute($page.params.space, path)
}

const room = $derived(store.matrix.active_room)

const active = $derived.by(() => {
    return room && item?.room_id == room?.room_id
})

$effect(() => {
    if(active && item?.room_id && authReady && !authenticated) {
        store.matrix.fetchRoomState(item.room_id)
    }
})

function getState() {
    if(item?.room_id && authReady && !authenticated) {
        store.matrix.fetchRoomState(item.room_id)
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
    <div class="room-name">
        {title} 
    </div>
</div>

<style>
.active {
    color: var(--text);
    background: var(--shade-3);
}

.room-item {
    font-size: 0.94rem;
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

</style>

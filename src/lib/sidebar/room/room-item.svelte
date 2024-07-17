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

const path = $derived(`/${$page.params.space}/${item.origin_server_ts}`)

function goToRoom() {

    goto(path)
    store.ui.updateRoute($page.params.space, path)
}

const active = $derived.by(() => {
    return item?.origin_server_ts == $page.params.room
})

$effect(() => {
    if(active && item?.room_id && authReady && !authenticated) {
        const state = store.matrix.room_state[item.room_id]
        if(!state) {
            store.matrix.fetchRoomState(item.room_id)
        }
    }
})

onMount(() => {
    if(active) {
        store.ui.updateRoute($page.params.space, path)
    }
})

</script>

<div class="cursor-pointer"
    class:active={active}
    onclick={goToRoom} oncontextmenu={log}>
    {item.name}
</div>

<style>
.active {
    color: red;
}
</style>

<script>
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { is_local_room, get_local_part } from '$lib/utils/matrix'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

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

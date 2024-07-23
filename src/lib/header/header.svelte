<script>
import { page } from '$app/stores';
import { bars } from '$lib/assets/icons'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const show_auth = $derived(store.auth.ready && store.auth.authenticated)

const menu_active = $derived(store.ui.menu_active)

function toggleMenu() {
    store.ui.toggleMenu()
}

const is_space = $derived($page.params.space != undefined)
const is_room = $derived($page.params.room != undefined)

const active_space = $derived(store.matrix.active_space)
const active_room = $derived(store.matrix.active_room)

const space_state = $derived.by(() => {
    return store.matrix.room_state[active_space?.room_id]
})

const room_state = $derived.by(() => {
    return store.matrix.room_state[active_room?.room_id]
})

const name = $derived.by(() => {
    if(is_room && active_room?.name) {
        return active_room.name
    }
    if(is_space && !is_room && active_space?.name) {
        return active_space.name
    }
    if(is_room && !active_room?.name) {
        return `Untitled Room`
    }
})

const space_topic = $derived.by(() => {
    return space_state?.find(r => r.type == 'm.room.topic')?.content?.topic
})

const room_topic = $derived.by(() => {
    return room_state?.find(r => r.type == 'm.room.topic')?.content?.topic
})

$effect(() => {
})

</script>

<div class="header grid 
    bg-header border-solid border-b border-border">
    <div class="menu grid cursor-pointer place-items-center" 
        onclick={toggleMenu}>
        <div class="icon h-[32px] w-[32px]">
            {@html bars}
        </div>
    </div>
    <div class="grid grid-cols-[auto_1fr_auto] mx-4 items-center justify-items-start">
        {#if is_room}
        <div class="font-semibold text-sm">
            {name}
        </div>
        {/if}

        {#if !is_room && is_space && space_topic}
        <div class="font-semibold text-sm">
            {space_topic}
        </div>
        {/if}

        {#if is_room && room_topic}
            <div class="ml-4 text-sm text-light">
                {room_topic}
            </div>
        {/if}
        <div class="">
        </div>
    </div>
</div>

<style>
.menu {
    display: none;
}
@media (max-width: 768px) {
    .header {
        grid-template-columns: 52px 1fr;
    }
    .menu {
        display: grid;
    }
}
</style>

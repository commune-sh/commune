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


const room_state = $derived(store.matrix.room_state)

const room = $derived(store.matrix.active_room)

const state = $derived.by(() => {
    return room_state[room?.room_id]
})

const name = $derived.by(() => {
    if(room?.name) {
        return room.name
    }
    return `Untitled Room`
})

const topic = $derived.by(() => {
    return state?.find(r => r.type == 'm.room.topic')?.content?.topic
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
        <div class="">
            {name}
        </div>
        {#if topic}
            <div class="ml-4 text-sm text-light">
                {topic}
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

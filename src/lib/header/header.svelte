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

import { 
    naiveRoomIDCheck
} from '$lib/utils/matrix'

const rooms = $derived(store.matrix.rooms)
const room_state = $derived(store.matrix.room_state)

const room = $derived.by(() => {
    const is_room_id = naiveRoomIDCheck($page.params.room)
    const key = is_room_id ? `room_id` : `origin_server_ts`
    return rooms?.filter(r => r[key] == $page.params.room)[0]
})

const state = $derived.by(() => {
    return room_state[room?.room_id]
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
    <div class="grid grid-cols-[auto_1fr_auto] mx-8 items-center justify-items-start">
        <div class="">
            {room?.name}
        </div>
        <div class="">
        </div>
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

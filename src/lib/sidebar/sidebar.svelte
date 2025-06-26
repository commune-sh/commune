<script>
import { getSetting, updateSetting } from '$lib/utils/localstorage';
import User from '$lib/sidebar/user/user.svelte'

import RoomSidebarHeader from '$lib/sidebar/room/room-sidebar-header.svelte'
import UserSidebarHeader from '$lib/sidebar/user/user-sidebar-header.svelte'
import RoomsSidebarHeader from '$lib/sidebar/rooms/rooms-sidebar-header.svelte'
import RoomSidebar from '$lib/sidebar/room/room-sidebar.svelte'
import UserSidebar from '$lib/sidebar/user/user-sidebar.svelte'

import { page } from '$app/state';

let {
    data,
    is_space,
    is_space_child_room,
    non_space_room
} = $props();


let is_home = $derived(page.route.id == '/(app)')

import { createStore } from '$lib/store/store.svelte'
const store = createStore()

const rooms = $derived.by(() => {
    return store.matrix.rooms
})

let saved_width = $derived.by(() => {
    return getSetting('sidebar_width');
});

let width = $state(saved_width || 232);

let resizing = $state(false);

let startX = $state(0);

const start = (e) => {
    resizing = true;
    startX = e.clientX;
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', done);
};

const resize = (e) => {
    if(resizing) {
        const deltaX = e.clientX - startX;
        if(deltaX > 0 && width >= 400) return;
        if(deltaX < 0 && width <= 232) return;
        width += deltaX;
        startX = e.clientX;
    }
};

const done = () => {
    resizing = false;
    updateSetting('sidebar_width', width);
    window.removeEventListener('mousemove', resize);
    window.removeEventListener('mouseup', done);
};

$effect(() => {
    if(resizing) {
        document.body.classList.add('resize-cursor');
    } else {
        document.body.classList.remove('resize-cursor');
    }
})

function showContextMenu(e) {
    e.preventDefault()
}


const active_space = $derived(store.matrix.active_space)
const space_state = $derived.by(() => {
    return store.matrix.room_state[active_space?.room_id]
})

</script>

<div class="sidebar grid grid-rows-[auto_1fr_70px]
    border-solid border-r border-sidebar-border h-dvh"
    style="width: {width}px">


    {#if non_space_room}
        <RoomsSidebarHeader />
    {:else if (is_space || is_space_child_room)}
        <RoomSidebarHeader />
    {:else if is_home}
        <UserSidebarHeader />
    {/if}

    <div class="sidebar-content overflow-hidden">
        <div class="rooms overflow-y-auto h-full"
            oncontextmenu={showContextMenu}
        >
            {#if is_space || is_space_child_room || non_space_room}
                <RoomSidebar />
            {:else if is_home}
                <UserSidebar />
            {/if}
        </div>
    </div>

    <User />
</div>


<div class="dragger absolute grid place-items-center" 
    class:resizing={resizing}
    onmousedown={start}>
    <div class="holder" >
    </div>
</div>


<style>

.dragger {
    width: 11px;
    right: -6px;
    top: 0;
    bottom: 0;
    cursor: col-resize;
    border-radius: 1px;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 10;
}

.resizing {
    opacity: 1;
}

.dragger:hover {
    opacity: 1;
}

.holder {
    height: 4rem;
    width: 6px;
    border-radius: 6px;
    background: var(--dragger);
    margin-left: -1px;
    z-index: 12;
}

::-webkit-scrollbar {
    width: 3px;
}
::-webkit-scrollbar-thumb {
    background: transparent;
    transition: 0.2s;
}
::-webkit-scrollbar-track {
    background: transparent;
    transition: 0.2s;
}

.rooms:hover::-webkit-scrollbar-thumb {
    background: var(--cmn-10);
}
</style>




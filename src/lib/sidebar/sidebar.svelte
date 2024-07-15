<script>
import { getSetting, updateSetting } from '$lib/utils/localstorage.js';
import User from '$lib/sidebar/user/user.svelte'

import RoomSidebar from './room-sidebar.svelte'
import UserSidebar from './user-sidebar.svelte'

import { page } from '$app/stores';

let is_home = $derived($page.route.id == '/(app)')
let is_space = $derived($page.params.space != undefined)
let is_room = $derived($page.params.room != undefined)

import { createStore } from '$lib/store/store.svelte.js'
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
        if(deltaX > 0 && width >= 300) return;
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


</script>

<div class="sidebar grid grid-rows-[1fr_70px]
    border-solid border-r border-sidebar-border"
    style="width: {width}px">

    {#if is_space || is_room}
        <RoomSidebar />
    {:else if is_home}
        <UserSidebar />
    {/if}

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
</style>




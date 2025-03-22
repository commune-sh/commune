<script>
import { left, hash } from '$lib/assets/icons'

import { createStore } from '$lib/store/store.svelte'
const store = createStore()

let {
    is_space,
    is_space_child_room,
    non_space_room
} = $props();

const show_auth = $derived(store.auth.ready && store.auth.authenticated)

const menu_active = $derived(store.ui.menu_active)

function toggleMenu() {
    store.ui.toggleMenu()
}


const active_space = $derived(store.matrix.active_space)
const active_room = $derived(store.matrix.active_room)

const space_state = $derived.by(() => {
    return store.matrix.room_state[active_space?.room_id]
})

const room_state = $derived.by(() => {
    return store.matrix.room_state[active_room?.room_id]
})

const name = $derived.by(() => {
    if(is_space_child_room && active_room?.name) {
        return active_room.name
    }
    if(is_space && !is_space_child_room && active_space?.name) {
        return active_space.name
    }
    if(is_space_child_room && !active_room?.name) {
        return `Untitled Room`
    }
})

const space_topic = $derived.by(() => {
    return space_state?.find(r => r.type == 'm.room.topic')?.content?.topic
})

const room_topic = $derived.by(() => {
    return room_state?.find(r => r.type == 'm.room.topic')?.content?.topic
})

const bridge_types = [
    'm.bridge', 
    'm.room.bridged', 
    'm.room.discord', 
    'm.room.irc', 
    'uk.half-shot.bridge',
];

const is_bridge = $derived.by(() => {
    return room_state?.filter(e => bridge_types.some(t => e.type === t))?.length
    > 0
})

const bridge_event = $derived.by(() => {
    return room_state?.filter(e => bridge_types.some(t => e.type === t))[0]
})

const bridge_name = $derived.by(() => {
    return bridge_event?.content?.protocol?.displayname || 
        bridge_event?.content?.protocol?.id ||
        `Bridge`
})

const is_discord = $derived.by(() => {
    return bridge_name?.toLowerCase().includes('discord')
})

$effect(() => {
})

</script>

<div class="header grid 
    bg-header border-solid border-b border-border">
    <div class="menu grid cursor-pointer place-items-center" 
        onclick={toggleMenu}>
        <div class="icon h-[26px] w-[26px]">
            {@html left}
        </div>
    </div>
    <div class="header-content overflow-hidden flex items-center justify-items-start">
        {#if is_space_child_room}
            <div class="hash h-[20px] w-[20px] mr-2">
                {@html hash}
            </div>
            <div class="font-semibold text-sm">
                {name}
            </div>
        {/if}

        {#if is_bridge}
            <div class="label ml-2"
            class:discord-brand={is_discord}>
                {bridge_name}
            </div>
        {/if}

        {#if !is_space_child_room && is_space}
            <div class="font-semibold text-sm text-light">
            </div>
        {/if}

        {#if is_space_child_room && room_topic}
            <div class="topic ml-4 my-4 text-xs text-light truncate">
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

.header-content {
    margin-left: 1rem;
    margin-right: 1rem;
}

@media (max-width: 768px) {
    .header {
        grid-template-columns: 52px 1fr;
    }
    .header-content {
        margin-left: 0rem;
        margin-right: 0rem;
    }
    .menu {
        display: grid;
    }
    .topic {
        display: none;
    }
}
.hash {
    fill: var(--light);
}

</style>

<script>
import { page } from '$app/state';

import ChatView from '$lib/room/chat/chat.svelte'
import ForumView from '$lib/room/forum/forum.svelte'
import RoomOverView from '$lib/room/overview/overview.svelte'

import { createStore } from '$lib/store/store.svelte'
const store = createStore()

let {
    is_space,
    is_space_child_room,
    non_space_room
} = $props();

const room_state = $derived(store.matrix.room_state)

const room = $derived(store.matrix.active_room)

const room_type = $derived(room?.type)

const is_chat = $derived(!room_type)
const is_forum = $derived(room_type == 'forum')

const state = $derived.by(() => {
    return room_state[room?.room_id]
})

$effect(() => {
})

</script>

{#if is_space_child_room}
    {#if is_chat}
        <ChatView />
    {:else if is_forum}
        <ForumView />
    {/if}
{:else}
    <RoomOverView 
        {is_space}
        {is_space_child_room}
        {non_space_room}
    />
{/if}

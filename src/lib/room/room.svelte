<script lang="ts">
import { page } from '$app/state';

import ChatView from './chat/chat.svelte'
import ForumView from './forum/forum.svelte'
import RoomOverView from './overview/overview.svelte'

import { createStore } from '../store/store.svelte'
const store = createStore()

import type { Data } from '../types/common'

let {
    data,
    is_space,
    is_space_child_room,
    non_space_room
}: {
    data: Data,
    is_space: boolean,
    is_space_child_room: boolean,
    non_space_room: boolean
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
        <ChatView {data} />
    {:else if is_forum}
        <ForumView {data} />
    {/if}
{:else}
    <RoomOverView 
        {data}
        {is_space}
        {is_space_child_room}
        {non_space_room}
    />
{/if}

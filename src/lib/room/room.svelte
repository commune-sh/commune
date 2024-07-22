<script>
import { page } from '$app/stores';

import ChatView from '$lib/room/chat/chat.svelte'
import ForumView from '$lib/room/forum/forum.svelte'
import RoomOverView from '$lib/room/overview/overview.svelte'

import { 
    naiveRoomIDCheck,
    naiveOSTCheck
} from '$lib/utils/matrix'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let is_space = $derived($page.params.space != undefined)
let is_room = $derived($page.params.room != undefined)

const rooms = $derived(store.matrix.rooms)
const room_state = $derived(store.matrix.room_state)

const room = $derived(store.matrix.active_room)

const room_type = $derived(room?.room_type)

const is_chat = $derived(!room_type)
const is_forum = $derived(room_type == 'forum')

const state = $derived.by(() => {
    return room_state[room?.room_id]
})

const messages = $derived.by(() => {
    return store.matrix.messages[room?.room_id]?.events
})

$effect(() => {
})

</script>

{#if is_room}
    {#if is_chat}
        <ChatView />
    {:else if is_forum}
        <ForumView />
    {/if}
{:else}
    <RoomOverView />
{/if}

<script>
import { page } from '$app/stores';

import ChatView from '$lib/room/chat/chat.svelte'
import ForumView from '$lib/room/forum/forum.svelte'
import RoomOverView from '$lib/room/overview/overview.svelte'

import Loading from '$lib/loading/loading.svelte'

import { 
    canonical_alias,
    naiveRoomIDCheck,
    naiveOSTCheck
} from '$lib/utils/matrix'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let is_space = $derived($page.params.space != undefined)
let is_room = $derived($page.params.room != undefined)

const rooms = $derived(store.matrix.rooms)
const room_state = $derived(store.matrix.room_state)

const room = $derived.by(() => {
    const is_room_id = naiveRoomIDCheck($page.params.room)
    const is_origin_server_ts = naiveOSTCheck($page.params.room)
    const key = is_room_id ? `room_id` : is_origin_server_ts ?
    `origin_server_ts` : `commune_alias` 
    return rooms?.filter(r => r[key] == $page.params.room)[0]
})

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

<script>
import RoomCreated from '$lib/room/chat/events/m.room.create.svelte'
import MessageEvent from '$lib/room/chat/events/m.room.message.svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const authenticated = $derived(store.auth.authenticated)

let {
    event,
} = $props();

const m_room_create = $derived(event?.type == 'm.room.create')

const m_room_message = $derived(event?.type == 'm.room.message')

const is_thread_message = $derived.by(() => {
    return event?.content?.['m.relates_to']?.['rel_type'] == 'm.thread'
})

const is_message = $derived.by(() => {
    return m_room_message && !is_thread_message
})

function logEvent(e) {
    e.preventDefault()
    console.log(event)
}

</script>

<div class="event" oncontextmenu={logEvent}>
{#if m_room_create}
    <RoomCreated {event} />
{:else if m_room_message && !is_thread_message}
    <MessageEvent {event} />
{:else if !is_thread_message}
    {JSON.stringify(event?.content)}
{/if}
</div>

<script>
import { dayOfMonth, formatTS } from '$lib/utils/time.js'

import RoomCreated from '$lib/room/chat/events/m.room.create.svelte'
import MessageEvent from '$lib/room/chat/events/m.room.message.svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const authenticated = $derived(store.auth.authenticated)

const events = $derived(store.matrix.active_room_events)

let {
    event,
    index
} = $props();

const prev_event = $derived.by(() => {
    if(index == 0) return
    return events?.[index - 1]
})

const next_event = $derived.by(() => {
    if(index == events.length - 1) return
    return events?.[index + 1]
})

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
    console.log("next event is", next_event)
}

const formattedTS = $derived(formatTS(event?.origin_server_ts))

const ts_diff = $derived.by(() => {
    if(!prev_event) return
    return (event?.origin_server_ts - prev_event?.origin_server_ts) / 1000
})

const isNewDay = $derived.by(() => {
    return dayOfMonth(event?.origin_server_ts) > dayOfMonth(prev_event?.origin_server_ts)
})

const prevSenderSame = $derived.by(() => {
    return prev_event?.sender == event?.sender
})

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


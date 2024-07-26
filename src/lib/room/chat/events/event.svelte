<script>
import { dayOfMonth, formatTS } from '$lib/utils/time.js'
import Time from '$lib/room/common/time.svelte'

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

const showSender = $derived.by(() => {
    return !prevSenderSame || isNewDay || ts_diff > 300
})

const id = $derived.by(() => {
    return event?.event_id
})

</script>

<div 
    data-event-id={id}
    class="event-container grid grid-cols-[72px_1fr] 
    hover:bg-shade-1 p-1 mr-1" 
>

    <div class="event-context">
        {#if showSender }

            <div class="event-sender">
            </div>

        {:else}
            <div class="time text-xs text-light ">
                <Time date={event.origin_server_ts} />
            </div>
        {/if}

    </div>

    <div class="event" 
        oncontextmenu={logEvent}>
    {#if m_room_create}
        <RoomCreated {event} />
    {:else if m_room_message && !is_thread_message}
        <MessageEvent {event} />
    {:else if !is_thread_message}
        {JSON.stringify(event?.content)}
    {/if}
    </div>


</div>

<style>
.event-container {
    font-size: 0.875rem;
    line-height: 1.375rem;
}
.event-container:hover .time {
    opacity: 1;
}
</style>

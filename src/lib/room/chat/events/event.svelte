<script>
import { dayOfMonth, formatTS } from '$lib/utils/time.js'
import Time from '$lib/room/common/time.svelte'
import Date from '$lib/room/common/date.svelte'

import Avatar from '$lib/room/common/avatar.svelte'
import Sender from '$lib/room/common/sender.svelte'

import RoomCreated from '$lib/room/chat/events/m.room.create.svelte'
import MessageEvent from '$lib/room/chat/events/m.room.message.svelte'
import MembershipEvent from '$lib/room/chat/events/m.room.member.svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const authenticated = $derived(store.auth.authenticated)

const events = $derived(store.matrix.active_room_events)

let {
    event,
    index
} = $props();

const sender = $derived(event?.sender)

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
const m_room_member = $derived(event?.type == 'm.room.member')
const m_room_topic = $derived(event?.type == 'm.room.topic')
const m_room_avatar = $derived(event?.type == 'm.room.avatar')
const m_reaction = $derived(event?.type == 'm.reaction')

const is_thread_message = $derived.by(() => {
    return event?.content?.['m.relates_to']?.['rel_type'] == 'm.thread'
})

const is_message = $derived.by(() => {
    return m_room_message && !is_thread_message
})

const is_replacement = $derived.by(() => {
    return event?.content?.['m.new_content'] != undefined && 
        event?.content?.['m.relates_to']?.['rel_type'] == 'm.replace'
})

const display_events = $state([
    {type: 'm.room.create', show: true },
    {type: 'm.room.message', show: true },
    {type: 'm.room.member', show: true },
    {type: 'm.room.topic', show: true },
    {type: 'm.room.avatar', show: true },
    {type: 'm.reaction', show: false},
    {type: 'm.room.redaction', show: true},
    {type: 'm.room.encryption', show: true},
    {type: 'm.room.history_visibility', show: true},
    {type: 'm.room.join_rules', show: true},
    {type: 'm.room.name', show: true},
    {type: 'm.room.power_levels', show: false},
    {type: 'm.room.guest_access', show: true},
    {type: 'm.room.canonical_alias', show: true},
    {type: 'm.room.pinned_events', show: true},
    {type: 'm.room.tombstone', show: true},
    {type: 'm.room.third_party_invite', show: true},
    {type: 'm.room.server_acl', show: true},
    {type: 'm.room.aliases', show: true},
    {type: 'm.room.related_groups', show: true},
])

const components = $state([
    {type: 'm.room.create', component: RoomCreated },
    {type: 'm.room.message', component: MessageEvent },
    {type: 'm.room.member', component: MembershipEvent },
])

const component = $derived.by(() => {
    return components.find(c => c.type == event?.type)?.component
})

const showEvent = $derived.by(() => {
    return display_events.find(e => e.type == event?.type)?.show &&
        !is_replacement
})

function logEvent(e) {
    e.preventDefault()
    console.log(event)
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
    return m_room_message && 
        (!prevSenderSame || isNewDay || ts_diff > 300)
})

const id = $derived.by(() => {
    return event?.event_id
})

</script>

{#if showEvent}
<div 
    data-event-id={id}
    class="event-container grid grid-cols-[72px_1fr] 
    hover:bg-shade-1 p-1 mr-1" 
    class:mt-1={showSender}
    class:pt-2={showSender}
>

    <div class="event-context grid justify-center">
        {#if showSender}
            <div class="event-sender">
                <Avatar {sender} />
            </div>
        {:else}
            <div class="time text-light justify-center opacity-0">
                <Time date={event.origin_server_ts} />
            </div>
        {/if}

    </div>

    <div class="event" 
        oncontextmenu={logEvent}>

        {#if showSender }
            <div class="event-sender">
                <Sender {event} />
                <span class="time ml-2 text-light">
                   <Date date={event?.origin_server_ts} />
                </span>
            </div>
        {/if}

        <svelte:component this={component} {event} />


    </div>


</div>
{/if}

<style>
.event-container {
    font-size: 0.875rem;
    line-height: 1.375rem;
}
.event-container:hover .time {
    opacity: 1;
}
.time {
    font-size: 10px;
}


@media (max-width: 768px) {
    .event-container {
        padding: 0;
        padding-right: 1rem;
    }
}
</style>

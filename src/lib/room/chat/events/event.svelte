<script>
import { page } from '$app/stores';
import { dayOfMonth, formatTS } from '$lib/utils/time.js'
import Time from '$lib/room/common/time.svelte'
import Date from '$lib/room/common/date.svelte'

import Reactions from '$lib/room/common/reactions.svelte'

import Avatar from '$lib/room/common/avatar.svelte'
import Sender from '$lib/room/common/sender.svelte'

import NewDay from '$lib/room/chat/components/new-day.svelte'
import RoomCreated from '$lib/room/chat/components/room-created.svelte'

import ReplyToEvent from '$lib/room/chat/events/reply-to-event.svelte'

import RoomCreateEvent from '$lib/room/chat/events/m.room.create.svelte'
import RoomNameEvent from '$lib/room/chat/events/m.room.name.svelte'
import MessageEvent from '$lib/room/chat/events/m.room.message.svelte'
import MembershipEvent from '$lib/room/chat/events/m.room.member.svelte'
import TopicEvent from '$lib/room/chat/events/m.room.topic.svelte'

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

const event_options = $state([
    {type: 'm.room.create', show: true },
    {type: 'm.room.message', show: true, reactions: true },
    {type: 'm.room.member', show: true, reactions: true },
    {type: 'm.room.topic', show: true },
    {type: 'm.room.avatar', show: true },
    {type: 'm.reaction', show: false},
    {type: 'm.room.redaction', show: false},
    {type: 'm.room.encryption', show: false},
    {type: 'm.room.history_visibility', show: false},
    {type: 'm.room.join_rules', show: false},
    {type: 'm.room.name', show: true},
    {type: 'm.room.power_levels', show: false},
    {type: 'm.room.guest_access', show: false},
    {type: 'm.room.canonical_alias', show: false},
    {type: 'm.room.pinned_events', show: false},
    {type: 'm.room.tombstone', show: false},
    {type: 'm.room.third_party_invite', show: false},
    {type: 'm.room.server_acl', show: false},
    {type: 'm.room.aliases', show: false},
    {type: 'm.room.related_groups', show: false},
])

const components = $state([
    {type: 'm.room.create', component: RoomCreateEvent },
    {type: 'm.room.name', component: RoomNameEvent },
    {type: 'm.room.message', component: MessageEvent },
    {type: 'm.room.member', component: MembershipEvent },
    {type: 'm.room.topic', component: TopicEvent },
])

const component = $derived.by(() => {
    return components.find(c => c.type == event?.type)?.component
})

const showReactions = $derived.by(() => {
    return event_options.find(e => e.type == event?.type)?.reactions
})

const reactions = $derived.by(() => {
    return events.filter(e => e.type == 'm.reaction' && 
    e.content?.['m.relates_to']?.event_id == event.event_id)
})

function logEvent(e) {
    e.preventDefault()
    console.log($state.snapshot(event))
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

const prevEventTypeSame = $derived.by(() => {
    return prev_event?.type == event?.type
})

const nextSenderSame = $derived.by(() => {
    return next_event?.sender == event?.sender
})

const nextEventTypeSame = $derived.by(() => {
    return next_event?.type == event?.type
})

const hideEvent = $derived.by(() => {
    return nextSenderSame && nextEventTypeSame &&
        event?.type != 'm.room.message' && 
        next_event?.type != 'm.room.message'
})

const is_reply = $derived.by(() => {
    return event?.content?.['m.relates_to']?.['m.in_reply_to']?.event_id != undefined
})

const showSender = $derived.by(() => {
    return m_room_message && 
        (!prevSenderSame || !prevEventTypeSame || isNewDay || ts_diff > 300 || is_reply)
})

const id = $derived.by(() => {
    return event?.event_id
})

const highlight = $derived.by(() => {
    const url_event = $page.url.searchParams.get('event');
    if(url_event == id) return true
    return false
})

let el;

$effect(() => {
    if(highlight) {
    }
})

const showEvent = $derived.by(() => {
    return event_options.find(e => e.type == event?.type)?.show &&
        !is_replacement && !hideEvent
})

</script>

{#if isNewDay}
    <NewDay {event} />
{/if}


{#if m_room_create}
    <RoomCreated />
{/if}

{#if showEvent}

<div 
    bind:this={el}
    ondblclick={logEvent}
    data-event-id={id}
    class="event-container grid
    hover:bg-shade-1 p-[0.2rem] mr-1" 
    class:highligt={highlight}
    class:mb-2={is_message && !nextEventTypeSame}
    class:mt-2={showSender}>


        {#if is_reply}
            <div class="reply-to-event grid grid-cols-[72px_1fr]">
                <div class="spine">
                </div>
                <ReplyToEvent {event} />
            </div>
        {/if}

<div class="event-body grid grid-cols-[72px_1fr]" >

    <div class="event-context grid justify-center">
        {#if showSender}
            <div class="event-sender mt-1">
                <Avatar {sender} />
            </div>
        {:else}
            <div class="time text-light justify-center opacity-0">
                <Time event={event} />
            </div>
        {/if}

    </div>

    <div class="event-content"> 

        {#if showSender }
            <div class="event-sender">
                <Sender {event} />
                <span class="time ml-2 text-light">
                   <Date event={event} />
                </span>
            </div>
        {/if}

        <svelte:component this={component} {event} />


            {#if showReactions && reactions?.length > 0 }
                <div class="reactions mt-1">
                    <Reactions {reactions} {event} />
                </div>
            {/if}
    </div>


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

.spine { 
    position: relative;
}

.spine::before {
    content: '';
    border-left: 2px solid var(--shade-9);
    border-top: 2px solid var(--shade-9);
    border-radius: 6px 0 0 0;
    position: absolute;
    box-sizing: border-box;
    top: 50%;
    right: 4px;
    bottom: 0;
    left: 34px;
    min-height: 0.5rem;
}

.highligt {
    background-color: var(--shade-2);
    border-left: 2px solid var(--primary);
}
</style>

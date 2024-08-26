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
import AvatarEvent from '$lib/room/chat/events/m.room.avatar.svelte'
import PowerLevelsEvent from '$lib/room/chat/events/m.room.power_levels.svelte'
import PinnedEvent from '$lib/room/chat/events/m.room.pinned_events.svelte'

import Menu from '$lib/event/menu/menu.svelte'



import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const authenticated = $derived(store.auth.authenticated)

const events = $derived(store.matrix.active_room_events)

let {
    event,
    index,
    thread_view
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

const has_event_before = $derived.by(() => {
    if(index > 0) return true
})

const has_msg_event_after = $derived.by(() => {
    if(index == events.length - 1) return
    return events?.slice(index + 1).find(e => e.type == 'm.room.message' && 
        e?.content?.['m.relates_to']?.['rel_type'] != 'm.thread') != undefined
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
    {type: 'm.room.power_levels', show: true},
    {type: 'm.room.guest_access', show: false},
    {type: 'm.room.canonical_alias', show: false},
    {type: 'm.room.pinned_events', show: true},
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
    {type: 'm.room.avatar', component: AvatarEvent },
    {type: 'm.room.power_levels', component: PowerLevelsEvent },
    {type: 'm.room.pinned_events', component: PinnedEvent },
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
    return dayOfMonth(event?.origin_server_ts) != dayOfMonth(prev_event?.origin_server_ts)
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
    return event?.content?.['m.relates_to']?.['m.in_reply_to']?.event_id !=
        undefined && event?.content?.formatted_body?.includes(`mx-reply`)
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
        !is_replacement && !hideEvent && 
        (thread_view ? true : !is_thread_message)
})

let hovered = $state(false);

function killHover() {
    hovered = false
}

let menu_active = $derived.by(() => {
    return store.ui.event_menu?.active &&
        store.ui.event_menu?.event?.event_id == id
})

let flashed = $derived.by(() => {
    return store.ui.flash_event == event?.event_id
})

</script>



{#if isNewDay && has_event_before && has_msg_event_after}
    <NewDay {event} />
{/if}


{#if m_room_create}
    <RoomCreated />
{/if}

{#if showEvent}


<div 
    bind:this={el}
    ondblclick={logEvent}
    onmouseover={() => hovered = true}
    onmouseleave={() => hovered = false}
    data-event-id={id}
    class="event-container grid relative
    p-[0.2rem] mr-1" 
    class:highligt={highlight || flashed}
    class:bg-shade-1={menu_active}
    class:mb-2={is_message && !nextEventTypeSame}
    class:mt-2={showSender}>

    {#if hovered || menu_active}
        <Menu {event} killHover={killHover} />
    {/if}


    {#if is_reply}
        <div class="reply-to-event grid grid-pad">
            <div class="spine">
            </div>
            <ReplyToEvent {event} />
        </div>
    {/if}

    <div class="event-body grid grid-pad" >

        <div class="event-context grid justify-center">
            {#if showSender}
                <div class="event-sender lg:mt-1">
                    <Avatar {sender} />
                </div>
            {:else}
                <div class="time text-3xs text-light justify-center opacity-0" 
                        title={formattedTS}>
                    <Time event={event} />
                </div>
            {/if}

        </div>

        <div class="event-content overflow-hidden"> 

            {#if showSender }
                <span class="event-sender">
                    <Sender {event} />
                    <span class="date text-2xs ml-1 text-light" title={formattedTS}>
                       <Date event={event} />
                    </span>
                </span>
            {/if}

            {#snippet event_user()}
                <Avatar sender={event?.sender} small={true} inline={true} />
                <Sender event={event} inline={true} />
            {/snippet}

            <svelte:component this={component} {event} {thread_view} {event_user} />


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

.grid-pad {
    grid-template-columns: 72px 1fr;
}

:global(:root.dark) {
    --event-container-hover: hsla(0, 0%, 100%, 0.05);
}

:global(:root.light) {
    --event-container-hover: hsla(0, 0%, 50%, 0.1);
}

.event-container {
    line-height: 1.375rem;
    border-left: solid 1px transparent;
}

.event-container:hover {
    background: var(--event-container-hover);
}

.event-container:hover .time {
    opacity: 1;
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

.reply-to-event {
    min-height: 2rem;
}

@media (max-width: 768px) {
    .grid-pad {
        grid-template-columns: 52px 1fr;
    }
    .event-container {
        font-size: 0.75rem;
        padding: 0;
        padding-right: 1rem;
        line-height: 1rem;
    }
    .spine::before {
        left: 26px;
    }
    .time {
        font-size: 0.5rem;
    }
    .date {
        font-size: 0.625rem;
    }
}


.highligt {
    background-color: var(--shade-2);
    border-left: 1px solid var(--primary);
}
</style>

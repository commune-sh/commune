<script>
import { trash } from '$lib/assets/icons'
import { justEmoji, processBody } from '$lib/utils/utils'

import Image from '$lib/room/common/m.image.svelte'
import Audio from '$lib/room/common/m.audio.svelte'
import Video from '$lib/room/common/m.video.svelte'
import File from '$lib/room/common/m.file.svelte'

import ThreadSummary from '$lib/room/chat/events/thread-summary.svelte';

const components = $state([
    {msgtype: 'm.image', component: Image },
    {msgtype: 'm.audio', component: Audio },
    {msgtype: 'm.video', component: Video },
    {msgtype: 'm.file', component: File },
])

const component = $derived.by(() => {
    return components.find(c => c.msgtype == event?.content?.msgtype)?.component
})

import { createStore } from '$lib/store/store.svelte'
const store = createStore()

const authenticated = $derived(store.session.authenticated)

let {
    event,
    thread_view
} = $props();

const new_content = $derived.by(() => {
    return event?.unsigned?.['m.relations']?.['m.replace']?.content?.['m.new_content']
})

const content = $derived.by(() => {
    let data = event?.content?.formatted_body ? event?.content?.formatted_body : event?.content?.body

    if(new_content) {
        data = new_content?.formatted_body ? new_content?.formatted_body : new_content?.body
    }
    return processBody(data)
})

const has_thread = $derived.by(() => {
    return event?.unsigned?.["m.relations"]?.["m.thread"]?.count > 0
})

const just_emoji = $derived.by(() => {
    return justEmoji(event?.content?.body)
})

const events = $derived(store.matrix.active_room_events)

const m_text = $derived.by(() => {
    return event?.content?.msgtype == 'm.text'
})

const m_notice = $derived.by(() => {
    return event?.content?.msgtype == 'm.notice'
})

const is_reply = $derived.by(() => {
    return event?.content?.['m.relates_to']?.['m.in_reply_to']?.event_id != undefined
})

const reply_to_event_id = $derived.by(() => {
    return event?.content?.['m.relates_to']?.['m.in_reply_to']?.event_id
})

const reply_to_event = $derived.by(() => {
    return events.find(e => e.event_id == reply_to_event_id)
})

const redacted = $derived.by(() => {
    return event?.unsigned?.['redacted_because']?.type == 'm.room.redaction'
})
</script>


{#if redacted}
<div class="chat-event pointer-events-none ">
    <span class="inline-block align-middle text-light opacity-70 lg:text-xs">
        Message Deleted.
    </span>
    <span class="trash inline-block align-middle icon h-[14px] w-[14px] ml-1">
        {@html trash}
    </span>
</div>
{:else}
<div class="chat-event lg:pr-[4rem]"
    class:my-1={!m_text}
    class:just-emoji={just_emoji}>
    {#if m_text || m_notice}
        {@html content}
        {#if new_content}
            <span class="text-light text-[0.8em]">(edited)</span>
        {/if}
    {/if}

    {#if !m_text}
        <svelte:component this={component} {event} />
    {/if}

</div>
{/if}


{#if has_thread && !thread_view}
    <ThreadSummary {event} />
{/if}


<style>

.chat-event { 
    word-break: break-word;
}

:global(.chat-event p) {
    margin-bottom: 0.5rem;
}

:global(.chat-event a) {
    color: var(--link);
    cursor: pointer;
}

:global(.chat-event .emoji) {
    font-family: 'Twemoji', 'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif;
    font-size: 1.3rem;
    vertical-align: bottom;
}
:global(.just-emoji .emoji) {
    font-family: 'Twemoji', 'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif;
    font-size: 2.4rem;
    vertical-align: text-bottom;
    line-height: 1;
}

:global(.mx-link) {
    background: var(--cmn-2);
    border-radius: 3px;
    padding: 0 0.1rem;
    font-weight: 500;
}

:global(.mx-link:hover) {
    background: var(--cmn-5);
}


:global(.mx-emoticon) {
    height: 16px;
    width: 16px;
    display: inline;
    vertical-align: top;
}

:global(.mx-emoticon-single) {
    height: 32px;
    width: 32px;
    display: inline;
    vertical-align: bottom;
}

@media (max-width: 768px) {
    .chat-event {
        font-size: 11px;
    }
    :global(.chat-event .emoji) {
        font-size: 1.1rem;
    }
    :global(.just-emoji .emoji) {
        font-size: 1.4rem;
    }
    .trash {
        height: 12px;
        width: 12px;
    }
    :global(.mx-emoticon) {
        height: 13px;
        width: 13px;
    }

    :global(.mx-emoticon-single) {
        height: 26px;
        width: 26px;
    }

}

</style>

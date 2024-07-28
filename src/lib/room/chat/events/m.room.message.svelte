<script>
import Image from '$lib/room/common/m.image.svelte'
import { trash } from '$lib/assets/icons'
import { justEmoji, processBody } from '$lib/utils/utils.js'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const authenticated = $derived(store.auth.authenticated)

let {
    event,
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

const is_img = $derived.by(() => {
    return event?.content?.msgtype == 'm.image' && 
        event?.content?.url
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
    <span class="inline-block align-middle text-light opacity-70 text-xs font-semibold">
        Message Deleted.
    </span>
    <span class="inline-block align-middle icon h-[15px] w-[15px] ml-1">
        {@html trash}
    </span>
</div>
{:else}
<div class="chat-event lg:pr-[5rem] sm:mr-[3rem]"
    class:just-emoji={just_emoji}>
    {#if !is_img}
        {@html content}
        {#if new_content}
            <span class="text-xs text-light">(edited)</span>
        {/if}
    {/if}
    {#if is_img}
        <Image {event} />
    {/if}
</div>
{/if}



<style>

.chat-event { 
}

@media (max-width: 768px) {
    .chat-event {
        font-size: 13px;
        line-height: 1.175rem;
    }
}

:global(.chat-event a) {
    color: var(--link);
}


:global(.chat-event .emoji) {
    font-size: 1.3rem;
    vertical-align: bottom;
}
:global(.just-emoji .emoji) {
    font-size: 2.4rem;
    vertical-align: text-bottom;
    line-height: 1;
}
</style>

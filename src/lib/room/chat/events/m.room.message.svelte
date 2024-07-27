<script>
import Image from '$lib/room/common/m.image.svelte'
import Reactions from '$lib/room/common/reactions.svelte'
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
const reactions = $derived.by(() => {
    return events.filter(e => e.type == 'm.reaction' && 
    e.content?.['m.relates_to']?.event_id == event.event_id)
})

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
</script>


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

{#if reactions?.length > 0 }
<div class="reactions mt-1">
    <Reactions {reactions} {event} />
</div>
{/if}


<style>

.chat-event { 
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

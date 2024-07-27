<script>
import { onMount } from 'svelte'
import { getEvent } from '$lib/appservice/requests'
import { getFirstParagraph } from '$lib/utils/string'

import Avatar from '$lib/room/common/avatar.svelte'
import Sender from '$lib/room/common/sender.svelte'

import SkeletonSpan from '$lib/skeleton/span.svelte'

import { processBody } from '$lib/utils/utils.js'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    event,
} = $props();

let _event = $state(null);

const events = $derived(store.matrix.active_room_events)
const reply_to_event_id = $derived.by(() => {
    return event?.content?.['m.relates_to']?.['m.in_reply_to']?.event_id
})

const reply_to_event = $derived.by(() => {
    return _event || events.find(e => e.event_id == reply_to_event_id)
})

const sender = $derived(reply_to_event?.sender)

const new_content = $derived.by(() => {
    return reply_to_event?.unsigned?.['m.relations']?.['m.replace']?.content?.['m.new_content']
})

const content = $derived.by(() => {
    let data = reply_to_event?.content?.formatted_body ?
        reply_to_event?.content?.formatted_body : reply_to_event?.content?.body

    if(new_content) {
        data = new_content?.formatted_body ? new_content?.formatted_body : new_content?.body
    }
    const processed = processBody(data)
    return getFirstParagraph(processed)
})

onMount(() => {
    if(!reply_to_event) {
        fetchEvent()
    }
})

async function fetchEvent() {

    try {
        const resp = await getEvent({
            event_id: reply_to_event_id,
            room_id: event.room_id,
        })
        if(resp) {
            console.log("fetched reply to event", resp)
            _event = resp
        }
    } catch(e) {
        console.error(e)
    }

}
</script>

<div class="reply-to grid grid-cols-[auto_auto_1fr] gap-x-1
    cursor-pointer justify-center mr-10"
class:animate-pulse={!reply_to_event}>

    <div class="grid place-items-center">
        <Avatar {sender} small={true} />
    </div>

    <div class="grid place-items-center">
        <Sender event={reply_to_event} />
    </div>

    <div class="flex items-center truncate ">
        {#if content}
            {@html content}
        {:else}
            <div class="h-full w-[200px] py-[0.2rem]">
            <SkeletonSpan />
            </div>
        {/if}
    </div>
</div>

<style>
.reply-to {
    font-size: 12px;
    color: var(--light);
    min-height: 26px;
}

.reply-to:hover {
    color: var(--text);
}

::global(.event-content p) {
    margin: 0;
    padding: 0;
}
</style>

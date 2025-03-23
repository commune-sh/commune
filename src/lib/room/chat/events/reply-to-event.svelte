<script>
import { onMount } from 'svelte'
import { getEvent } from '$lib/appservice/requests.svelte'
import { getFirstLine } from '$lib/utils/string'

import Avatar from '$lib/room/common/avatar.svelte'
import Sender from '$lib/room/common/sender.svelte'

import SkeletonSpan from '$lib/skeleton/span.svelte'

import { processBody, textContent } from '$lib/utils/utils'

import { createStore } from '$lib/store/store.svelte'
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
    return textContent(processed)
    //return getFirstLine(processed)
})

onMount(() => {
    if(!reply_to_event) {
        fetchEvent()
    }
})

async function fetchEvent() {

    try {
        const resp = await getEvent(store.app.appservice, {
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

function goToEvent() {
    console.log(reply_to_event)
}
</script>


<div onclick={goToEvent}
    class="content-body content-center text-2xs
    truncate text-light mr-10 cursor-pointer">
    <Avatar {sender} small={true} inline={true} />
    <Sender event={reply_to_event} inline={true} />
    {#if content}
        <span class="reply-content">
            {@html content}
        </span>
    {:else}
        <span class="inline-block ml-1 align-middle h-[20px] w-[200px] py-[0.2rem] animate-pulse">
            <SkeletonSpan />
        </span>
    {/if}
</div>

<style>
.content-body {
}

@media (max-width: 768px) {
    .content-body {
        font-size: 10px;
    }
}
.content-body:hover {
    color: var(--text);
}
</style>

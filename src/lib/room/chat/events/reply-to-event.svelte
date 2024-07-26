<script>
import Avatar from '$lib/room/common/avatar.svelte'
import Sender from '$lib/room/common/sender.svelte'

import { processBody } from '$lib/utils/utils.js'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    event,
} = $props();

const events = $derived(store.matrix.active_room_events)
const reply_to_event_id = $derived.by(() => {
    return event?.content?.['m.relates_to']?.['m.in_reply_to']?.event_id
})

const reply_to_event = $derived.by(() => {
    return events.find(e => e.event_id == reply_to_event_id)
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
    return processBody(data)
})
</script>

<div class="reply-to grid grid-cols-[auto_auto_1fr] gap-x-1
    cursor-pointer justify-center mr-10">

    <div class="grid place-items-center">
        <Avatar {sender} small={true} />
    </div>

    <Sender event={reply_to_event} />

    <div class="truncate justify-center">
        {@html content}
    </div>
</div>

<style>
.reply-to {
    font-size: 12px;
    color: var(--light);
}

.reply-to:hover {
    color: var(--text);
}
</style>

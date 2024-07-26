<script>
import Date from '$lib/room/common/date.svelte'
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

</script>


<div class="chat-event lg:pr-[5rem] sm:mr-[3rem]"
    class:just-emoji={just_emoji}>
    {@html content}
    {#if new_content}
        <span class="text-xs text-light">edited</span>
    {/if}
</div>

{#if reactions?.length > 0 }
<div class="reactions">
    {reactions?.length}
</div>
{/if}


<style>

.chat-event { 
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

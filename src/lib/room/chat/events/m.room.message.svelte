<script>
import Date from '$lib/room/common/date.svelte'
import { justEmoji, processBody } from '$lib/utils/utils.js'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const authenticated = $derived(store.auth.authenticated)

let {
    event,
} = $props();

const content = $derived.by(() => {
    let data = event?.content?.formatted_body ? event?.content?.formatted_body : event?.content?.body
    return processBody(data)
})

const has_thread = $derived.by(() => {
    return event?.unsigned?.["m.relations"]?.["m.thread"]?.count > 0
})

const just_emoji = $derived.by(() => {
    return justEmoji(event?.content?.body)
})

</script>


<div class="chat-event lg:pr-[5rem] sm:mr-[3rem]"
    class:just-emoji={just_emoji}>
    {@html content}
</div>

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

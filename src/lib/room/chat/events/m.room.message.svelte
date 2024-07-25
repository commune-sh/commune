<script>
import { justEmoji } from '$lib/utils/utils.js'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const authenticated = $derived(store.auth.authenticated)

let {
    event,
} = $props();

const content = $derived.by(() => {
    if(event?.content?.formatted_body) {
        return event?.content?.formatted_body
    }
    return event?.content?.body
})

const has_thread = $derived.by(() => {
    return event?.unsigned?.["m.relations"]?.["m.thread"]?.count > 0
})

const just_emoji = $derived.by(() => {
    return justEmoji(event?.content?.body)
})

</script>

<div class="chat-event text-sm pb-4 hover:bg-shade-1"
    class:text-4xl={just_emoji}>
    {@html content}
</div>

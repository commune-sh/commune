<script>
import Avatar from '$lib/room/common/avatar.svelte'
import Sender from '$lib/room/common/sender.svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    event,
} = $props();


const sender = $derived(event?.sender)

const topic = $derived.by(() => {
    return event?.content?.topic
})

const has_prev = $derived.by(() => {
    return event?.prev_content?.topic
})

const action = $derived.by(() => {
    return has_prev ? `changed`: `set`
})

</script>

<div class="content-center text-xs mt-[0.2rem]">
    <Avatar {sender} small={true} inline={true} />
    <Sender event={event} />
    <span class="">
        <span class="text-light">created the room</span>
    </span>
</div>

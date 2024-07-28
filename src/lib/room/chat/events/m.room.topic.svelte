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

<div class="grid grid-cols-[auto_auto_1fr] text-xs h-full">
    <div class="grid items-center">
        <Avatar {sender} small={true} />
    </div>

    <div class="grid items-center ml-1">
        <Sender event={event} />
    </div>

    <div class="flex items-center ml-1">
        <span class="mr-1 text-light">{action} the room topic to </span>
        <span class="font-semibold">{topic}</span>
    </div>
</div>

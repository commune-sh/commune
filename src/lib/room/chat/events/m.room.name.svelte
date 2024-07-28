<script>
import Avatar from '$lib/room/common/avatar.svelte'
import Sender from '$lib/room/common/sender.svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    event,
} = $props();


const sender = $derived(event?.sender)

const name = $derived.by(() => {
    return event?.content?.name
})

const has_prev = $derived.by(() => {
    return event?.prev_content?.name
})

const action = $derived.by(() => {
    return has_prev ? `changed`: `set`
})

</script>

<div class="content-center text-xs mt-[0.2rem]">
    <Avatar {sender} small={true} inline={true} />
    <Sender event={event} />
    <span class="">
        <span class="text-light">{action} the room name to </span>
        <span class="font-semibold">{name}</span>
    </span>
</div>

<script>
import Avatar from '$lib/room/common/avatar.svelte'
import Sender from '$lib/room/common/sender.svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    event,
} = $props();


const sender = $derived(event?.sender)

</script>

<div class="content-center text-xs">
    <Avatar {sender} small={true} inline={true} />
    <Sender event={event} inline={true} />
    <span class="">
        <span class="text-light">updated the room's permissions.</span>
    </span>
</div>

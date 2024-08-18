<script>
import Avatar from '$lib/room/common/avatar.svelte'
import Sender from '$lib/room/common/sender.svelte'

import { pin } from '$lib/assets/icons'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    event,
} = $props();


const sender = $derived(event?.sender)

const has_prev = $derived.by(() => {
    return event?.prev_content?.topic
})

function goToEvent() {
    store.ui.updateFlashEvent(event?.event_id)
}

</script>

<div class="content-center text-xs">
    <Avatar {sender} small={true} inline={true} />
    <Sender event={event} inline={true} />
    <span class="">
        <span class="text-light">pinned  
            <span class="link" onclick={goToEvent}>a message</span> to this room.
            See all
            <span class="link">pinned messages</span>.
        </span>
    </span>
    <span class="pin icon h-[16px] w-[16px]">
        {@html pin}
    </span>
</div>

<style>
.link {
    color: var(--text);
    cursor: pointer;
}
.link:hover {
    text-decoration: underline;
}
.pin {
    display: inline-block;
    vertical-align: middle;
}
</style>

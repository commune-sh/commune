<script>
import { aliasFromSender } from '$lib/utils/matrix';

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    event,
    event_user,
} = $props();


const sender = $derived(event?.sender)

const same_membership = $derived.by(() => {
    return event?.content?.membership == event?.['prev_content']?.membership 
})

const new_displayname = $derived.by(() => {
    return event?.content?.displayname != event?.['prev_content']?.displayname 
})

const new_avatar_url = $derived.by(() => {
    return event?.content?.avatar_url != event?.['prev_content']?.avatar_url 
})

const joined = $derived.by(() => {
    const new_join = event?.content?.membership == 'join' && !event?.['prev_content'] 
    const invite_join = event?.content?.membership == 'join' && 
        event?.['prev_content']?.membership == 'invite'

    return new_join || invite_join
})

const left = $derived.by(() => {
    return event?.content?.membership == 'leave' && 
        event?.['prev_content']?.membership == 'join'
})

const invited = $derived.by(() => {
    return event?.content?.membership == 'invite' 
})

const invited_user = $derived.by(() => {
    return aliasFromSender(event?.state_key)
})

const action = $derived.by(() => {
    if(joined) return 'joined'
    if(left) return 'left'
})

</script>

<div class="content-center lg:text-xs md:text-xs sm:text-3xs">
    {@render event_user()}
    <span class="text-light">
        {#if joined || left}
            {action} the room
        {:else if invited}
            invited <span class="text-text">{invited_user}</span> to the room
        {:else if new_displayname}
            changed their name
        {:else if new_avatar_url}
            changed their profile picture
        {/if}
    </span>
</div>

<style>
</style>

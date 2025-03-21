<script>
import { createStore } from '$lib/store/store.svelte'
const store = createStore()

import { aliasFromSender } from '$lib/utils/matrix';

let {
    event,
    inline
} = $props();

const state = $derived(store.matrix.active_room_state)

const user = $derived.by(() => {
    return state?.find(x => x.state_key === event?.sender)
})

const sender = $derived(event?.sender)

const displayname = $derived.by(() => {
    return user?.content?.displayname
})

const name = $derived(displayname ? displayname : sender ?
aliasFromSender(sender) : ``)

const is_discord = $derived.by(() => {
    return user?.content && 
        Object.keys(user?.content).some(key => key.includes(`discord`));
})

</script>

<span class="sender font-medium" 
class:text-light={inline}
class:align-middle={is_discord && !inline}>
    {name} 
</span>

{#if is_discord && !inline}
<span class="label ml-1 discord-brand">
    discord
</span>
{/if}

<style>
</style>

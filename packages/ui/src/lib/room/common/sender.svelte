<script lang="ts">
import { createStore } from '../../store/store.svelte'
const store = createStore()

import { aliasFromSender } from '../../utils/matrix';

import type { Data } from '../../types/common'

let {
    data,
    event,
    inline,
    prev_sender
}: {
    data: Data,
    event: any,
    inline?: boolean
    prev_sender?: boolean
} = $props();

const state = $derived(store.matrix.active_room_state)

const which_user = $derived.by(() => {
    return prev_sender ? event?.unsigned?.prev_sender : event?.sender
})

const user = $derived.by(() => {
    return state?.find((x: any) => x.state_key === which_user)
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

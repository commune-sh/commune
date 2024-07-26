<script>
import { 
    thumbnailURL,
} from '$lib/utils/matrix'

import { createInitials } from '$lib/utils/string';

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    sender
} = $props();

const room_state = $derived(store.matrix.room_state)
const room = $derived(store.matrix.active_room)
const state = $derived.by(() => {
    return room_state[room?.room_id]
})

const user = $derived.by(() => {
    return state?.find(x => x.state_key === sender)
})

const avatar = $derived.by(() => {
    if(user?.content?.avatar_url) {
        return thumbnailURL(user.content.avatar_url, 46, 46)
    }
})

const displayname = $derived.by(() => {
    return user?.content?.displayname?.toUpperCase()
})

const initial = $derived(createInitials(displayname))
</script>

<div class="avatar bg-avatar bg-avatar grid place-items-center cursor-pointer">
    {#if avatar}
        <img src={avatar} alt={displayname} class="avatar" loading="lazy" />
    {/if}
    {#if !avatar}
        <div class="initial font-semibold">
            {initial} 
        </div>
    {/if}
</div>

<style>
.avatar {
    border-radius: 50%;
    height: 34px;
    width: 34px;
}
</style>

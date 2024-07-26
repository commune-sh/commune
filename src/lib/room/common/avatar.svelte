<script>
import { 
    thumbnailURL,
} from '$lib/utils/matrix'

import { createInitials } from '$lib/utils/string';

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    sender,
    small
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
        return thumbnailURL(user.content.avatar_url, 32, 32, 'crop')
    }
})

const displayname = $derived.by(() => {
    return user?.content?.displayname?.toUpperCase()
})

const initial = $derived(createInitials(displayname))

const d = $derived.by(() => {
    return small ? 16 : 32
})

</script>

<div class="avatar bg-avatar bg-avatar grid place-items-center cursor-pointer"
    class:small={small} >
    {#if avatar}
        <img src={avatar} 
            width={d} height={d}
            alt={displayname} class="" loading="lazy" />
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
    height: 32px;
    width: 32px;
    line-height: 1;
}

.small {
    width: 16px;
    height: 16px;
    font-size: 10px;
}
img {
    border-radius: 50%;
}
</style>

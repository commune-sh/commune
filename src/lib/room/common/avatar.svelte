<script>
import { 
    thumbnailURL,
} from '$lib/utils/matrix'

import { createInitials } from '$lib/utils/string';
import { aliasFromSender } from '$lib/utils/matrix';

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    sender,
    small,
    inline
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

const name = $derived(displayname ? displayname : aliasFromSender(sender))

const initial = $derived(createInitials(name))

const d = $derived.by(() => {
    return small ? 16 : 32
})

</script>

{#snippet content()}
    {#if avatar}
        <img src={avatar} 
            width={d} height={d}
            alt={displayname} class="" loading="lazy" />
    {/if}
    {#if !avatar}
        <div class="initial font-semibold uppercase">
            {initial} 
        </div>
    {/if}
{/snippet}

{#if inline}
    <div class="inline-block align-text-bottom avatar bg-avatar" class:small={small}>
        {@render content()}
    </div>
{:else}
<div class="avatar bg-avatar bg-avatar grid place-items-center cursor-pointer"
    class:small={small} >
        {@render content()}
</div>
{/if}

<style>
.avatar {
    border-radius: 50%;
    height: 32px;
    width: 32px;
}

.small {
    width: 14px;
    height: 14px;
    font-size: 10px;
}

.initial {
    line-height: normal;
    text-align: center;
}

img {
    border-radius: 50%;
}
</style>

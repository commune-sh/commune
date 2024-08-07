<script>
import { logo } from '$lib/assets/logo.js';
import UserLogo from '$lib/assets/logo-base.png';

import { 
    thumbnailURL,
} from '$lib/utils/matrix'

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
        <img src={UserLogo} 
            width={d} height={d}
            alt={displayname} class="" loading="lazy" />
    {/if}
{/snippet}

{#if inline}
    <div class="inline-block rounded-[50%] bg-avatar align-text-bottom" 
        class:small={small}>
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

.big {
    width: 22px;
    height: 22px;
}

.small {
    width: 16px;
    height: 16px;
}

img {
    border-radius: 50%;
}

.user {
    fill: var(--logo-fill-inactive);
}

.user:hover {
}
</style>

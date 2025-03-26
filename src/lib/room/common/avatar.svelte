<script>
import { logo } from '$lib/assets/logo.js';
import UserLogo from '$lib/assets/logo-base.png';

import { 
    thumbnailURL,
} from '$lib/utils/matrix'

import { 
    getAvatarThumbnail,
} from '$lib/appservice/requests.svelte'


import { aliasFromSender } from '$lib/utils/matrix';

import { createStore } from '$lib/store/store.svelte'
const store = createStore()

let authenticated = $derived(store.auth?.authenticated)

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

const avatar_exists = $derived.by(() => {
    return user?.content?.avatar_url ? true : false
})

const displayname = $derived.by(() => {
    return user?.content?.displayname?.toUpperCase()
})

const name = $derived(displayname ? displayname : aliasFromSender(sender))


const d = $derived.by(() => {
    return small ? 16 : 32
})

$effect(() => {
    if(store.app.appservice && !authenticated) {
        getAvatar()
    }
})

let avatar_url = $state(null);
async function getAvatar() {
    if(!user?.content?.avatar_url) return
    let content_uri = await getAvatarThumbnail({
        mxcid: user.content.avatar_url,
        width: 32,
        height: 32,
        method: 'crop'
    })
    if(content_uri) {
        avatar_url = content_uri
    }
}


</script>

{#snippet content()}
    {#if avatar_exists && avatar_url}
        <img src={avatar_url} 
            width={d} height={d}
            alt={displayname} class="" loading="lazy" />
    {/if}
    {#if !avatar_exists}
        <img src={UserLogo} 
            width={d} height={d}
            alt={displayname} class="" loading="lazy" />
    {/if}
{/snippet}

{#if inline}
    <div class="inline-block rounded-[50%] align-text-bottom bg-cmn-5" 
        class:bg-avatar={!avatar_exists}
        class:small={small}>
        {@render content()}
    </div>
{:else}
<div class="avatar grid place-items-center cursor-pointer bg-cmn-5"
    class:bg-avatar={!avatar_exists}
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

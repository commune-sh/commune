<script lang="ts">

import { createInitials } from '$lib/utils/string';
import { 
    getAvatarThumbnail,
} from '$lib/appservice/requests.svelte'

import { createStore } from '$lib/store/store.svelte'
const store = createStore()


import { createMatrixStore } from '$lib/store/matrix.svelte'
const matrix_store = createMatrixStore()

let user_id = $derived.by(() => {
    return matrix_store.client.getUserId()
})

let profile: {
    displayname?: string | undefined,
    avatar_url?: string | undefined
} | null = $state(null);

async function fetchProfile() {
    if(!user_id) return
    let p = await matrix_store.client.getProfileInfo(user_id)
    if (p?.displayname || p?.avatar_url) {
        console.log(profile)
        profile = p
    }
}


let displayname = $derived.by(() => {
    return profile?.displayname
})

const initial = $derived(createInitials(displayname))

let avatar_url = $derived.by(() => {
    return profile?.avatar_url
})

$effect(() => {
    if(user_id) {
        fetchProfile()
    }
    if(avatar_url) {
        fetchAvatar()
    }
})

let avatar: string | null = $state(null);

async function fetchAvatar() {
    if(!avatar_url) return
    let content_uri = await getAvatarThumbnail({
        mxcid: avatar_url,
        width: 96,
        height: 96,
        method: 'crop'
    })
    if(content_uri) {
        avatar = content_uri
    }
}

</script>


<div class="grid relative place-items-center mb-4">
    <div class="space bg-cmn-4 w-[46px] h-[46px] grid
            transition-transform duration-200
            place-items-center cursor-pointer hover:bg-cmn-7 rounded-[50%]" >

        {#if avatar}
            <img src={avatar} alt={displayname} class="rounded-[50%]" />
        {/if}
        {#if !avatar}
            <div class="text-cmn-1 text-xs font-bold">
                {initial}
            </div>
        {/if}
    </div>
</div>

<style>
img {
    width: 46px;
    height: 46px;
    border-radius: 50%;
}

</style>


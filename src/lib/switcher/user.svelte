<script lang="ts">

import { Popover, Separator, Toggle } from "bits-ui";

let width = $state(1024);
let height = $state(768);

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

    <Popover.Root>
        <Popover.Trigger
            class="space bg-cmn-4 w-[46px] h-[46px] grid
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

        </Popover.Trigger>
        <Popover.Portal>
            <Popover.Content preventScroll={true}
                class="border-dark-10 bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-30 w-full max-w-[328px] rounded-[12px] border p-4"
                sideOffset={14} align="start" side={"top"} alignOffset={0}
            >
                <div class="flex items-center pb-2">
                    {user_id}
                </div>
            </Popover.Content>
        </Popover.Portal>
    </Popover.Root>


</div>

<style>
img {
    width: 46px;
    height: 46px;
    border-radius: 50%;
}

button { 
    background-color: none;
}
</style>


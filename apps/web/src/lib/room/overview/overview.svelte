<script lang="ts">
import { marked } from 'marked'
import { createInitials } from '../../utils/string';

import { 
    get_local_part,
} from '../../utils/matrix'

import { 
    getImageThumbnail,
} from '../../appservice/requests.svelte'


import { createStore } from '../../store/store.svelte'
const store = createStore()

import type { Data } from '../../types/common'

let {
    data,
    is_space,
    is_space_child_room,
    non_space_room
}: {
    data: Data,
    is_space: boolean,
    is_space_child_room: boolean,
    non_space_room: boolean
} = $props();


const active_space = $derived(store.matrix.active_space)

const space_state = $derived.by(() => {
    return store.matrix.room_state[active_space?.room_id]
})

const overview = $derived.by(() => {
    return space_state?.find(r => r.type == 'commune.room.overview')?.content
})

const member_count = $derived.by(() => {
    return space_state?.filter(r => r.type == 'm.room.member')?.length
})

const ready = $derived(space_state != undefined)

let avatar: string | undefined = $state(undefined)

let avatar_url = $derived.by(() => {
    return space_state?.find(r => r.type == 'm.room.avatar')?.content?.url
})

async function getAvatar() {
    let content_uri = await getImageThumbnail(data.ENV.APPSERVICE_URL, {
        mxcid: avatar_url,
        width: 96,
        height: 96,
        method: 'crop'
    })
    if(content_uri) {
        avatar = content_uri
    }
}

$effect(() => {
    if(avatar_url) {
        getAvatar()
    }
    if(!avatar_url) {
        avatar = undefined
    }
})

const name = $derived.by(() => {
    if(active_space?.name) {
        return active_space.name
    }
    if(active_space?.canonical_alias) {
        return get_local_part(active_space.canonical_alias)
    }
})

const initial = $derived(createInitials(name))

const alias = $derived.by(() => {
    return active_space?.canonical_alias
})

const topic = $derived.by(() => {
    return active_space?.topic
})

const render_topic = $derived.by(() => {
    if(topic) {
        return marked.parse(topic)
    }
})

</script>

{#if ready}
<div class="flex h-full justify-center items-center">
    <div class="overview flex flex-col p-2 text-center">
        <div class="flex justify-center min-h-[80px] mb-4">
            {#if avatar}
                <div class="bg-cmn-4 rounded-[50%]">
                    <img src={avatar} class="w-20 h-20 rounded-full mx-auto" />
                </div>
            {/if}
            {#if !avatar_url}
                <div class="flex place-items-center bg-cmn-4 rounded-[50%] w-[80px] h-[80px]">
                    <div class="w-full font-semibold uppercase text-3xl">
                        {initial} 
                    </div>
                </div>
            {/if}
        </div>
        <div class="font-semibold text-xl">
            {name}
        </div>
        <div class="mt-2 text-sm text-light">
            {member_count} members
        </div>
        <div class="topic mt-4 ">
            {#if render_topic}
                {@html render_topic}
            {/if}
        </div>
    </div>
</div>
{/if}

{#if non_space_room}
<div class="flex h-full justify-center items-center">
    <div class="overview flex flex-col p-2 text-center">
        <div class="text">
            These rooms don't belong to any spaces.
        </div>
        <div class="mt-2 text-sm text-light">
            Select a room.
        </div>
    </div>
</div>
{/if}


<style>
.overview {
    max-width: 400px;
    line-height: 1.375;
    margin-top: -6rem;
}

:global(.topic a) {
    color: var(--link);
    cursor: pointer;
}
</style>

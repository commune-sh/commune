<script lang="ts">
import { page } from '$app/state';
import { 
    get_local_part,
} from '../../utils/matrix'

import { 
    getImageThumbnail,
} from '../../appservice/requests.svelte'

import type { Data } from '../../types/common'

let {
    data,
}: {
    data: Data,
} = $props();


import { createStore } from '../../store/store.svelte'
const store = createStore()

const space = $derived(store.matrix.active_space)

const name = $derived.by(() => {
    if(space?.name) {
        return space.name
    }
    if(space?.canonical_alias) {
        return get_local_part(space.canonical_alias)
    }
    return space?.room_id
})

const space_state = $derived.by(() => {
    return store.matrix.space_state;
})

let banner: string | undefined = $state(undefined)

let banner_url = $derived.by(() => {
    return space_state?.get('commune.room.banner')?.content?.url
})

async function getBanner() {
    let content_uri = await getImageThumbnail(data.ENV.APPSERVICE_URL, {
        mxcid: banner_url,
        width: 640,
        height: 480,
        method: 'scale'
    })
    if(content_uri) {
        banner = content_uri
    }
}

$effect(() => {
    if(!banner && banner_url) {
        getBanner()
    }
})

</script>

<div class="sidebar-header grid 
    bg-header border-solid border-b border-border bg-img"
    class:h-[52px]={!banner}
    class:h-[130px]={banner}
    style="background-image: url({banner})"
>
    <div class="flex mx-2 "
    class:items-center={!banner}
    class:mt-2={banner}>
        <div class="font-bold px-2 py-1">
            {name}
        </div>
        <div class="">
        </div>
        <div class="">
        </div>
    </div>
</div>

<style>
</style>

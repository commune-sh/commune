<script lang="ts">
import type { Data } from '../../../types/common'

import { createStore } from '../../../store/store.svelte'
const store = createStore()

import { 
    getImageThumbnail,
} from '../../../appservice/requests.svelte'

let authenticated = $derived(store.session.authenticated)

let {
    data,
    event,
    event_user,
}: {
    data: Data,
    event: any,
    event_user: any,
} = $props();

const sender = $derived(event?.sender)

let url: string | null = $state(null);

$effect(() => {
    if(store.app.appservice && !authenticated && !url) {
        getImage()
    }
})

async function getImage() {
    if(!event?.content?.url) return

    let w = 320
    let h = 240

    let content_uri = await getImageThumbnail(data.ENV.PUBLIC_APPSERVICE_URL, {
        mxcid: event.content.url,
        width: w,
        height: h,
        method: 'crop'
    })

    if(content_uri) {
        url = content_uri
    }
}


const has_prev = $derived.by(() => {
    return event?.prev_content?.topic
})

const action = $derived.by(() => {
    return has_prev ? `changed`: `set`
})

</script>

<div class="content-center text-xs mt-[0.2rem]">
    {@render event_user()}
    <span class="">
        <span class="text-light">{action} the room avatar to </span>
        <span class="inline-block align-text-bottom ml-1 cursor-pointer">
            <img src={url} 
                width="14" height="14"
                class="" loading="lazy" />
        </span>
    </span>
</div>


<style>
img {
    border-radius: 50%;
}
</style>

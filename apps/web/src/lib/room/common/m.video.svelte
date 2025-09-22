<script lang="ts">
import type { Data } from '../../types/common'

import { downloadMedia } from '../../appservice/requests.svelte'

let {
    data, 
    event,
}: {
    data: Data,
    event: any,
} = $props();

let video;

const size = $derived(event?.content?.info?.size)
const duration = $derived(event?.content?.info?.duration/ 1000)
const mimetype = $derived(event?.content?.info?.mimetype)
const url = $derived(event?.content?.url)
const alt = $derived(event?.content?.body)


let src: string | undefined = $state(undefined)

async function getSrc() {
    let content_uri = await downloadMedia(data.ENV.PUBLIC_APPSERVICE_URL, url)
    if(content_uri) {
        src = content_uri
    }
}

$effect(() => {
    if(!src && url) {
        getSrc()
    }
})

</script>

<div class="video">
    <video bind:this={video} 
        src={src} 
        type={mimetype} controls>
    </video>
</div>


<style>
video {
    height: 200px;
}
</style>

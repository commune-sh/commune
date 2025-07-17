<script lang="ts">
import type { Data } from '../../types/common'

//import { decode } from "blurhash";
import ExpandImage from '../common/expand-image.svelte'

import { 
    thumbnailURL,
} from '../../utils/matrix'

import { 
    getImageThumbnail,
    downloadMedia
} from '../../appservice/requests.svelte'


import { createStore } from '../../store/store.svelte'
const store = createStore()
let authenticated = $derived(store.session.authenticated)

let {
    data,
    event,
}: {
    data: Data,
    event: any,
} = $props();

const img_info = $derived.by(() => {
    return event?.content?.info
})

const h = $derived(img_info?.h)
const w = $derived(img_info?.w)
const whr = $derived(h/w)
const hwr = $derived(w/h)

const height = $derived.by(() => {
    if(h > w && w >= 320) {
        return 320
    }
    return width * whr
})

const width = $derived.by(() => {
    if(h > w && w >= 320) {
        return height * hwr
    }
    if(w >= 320) {
        return 320
    }
    return w
})


const blurhash = $derived(img_info?.['xyz.amorgan.blurhash'])

let el;

const decoded = $derived.by(() => {
    if(blurhash) {
        //return decode(blurhash, w, h);
    }
})

let blurhash_url = $state(null);
let blurhash_set = $state(false);

$effect(() => {
    /*
    if(!blurhash_set && decoded && w && h) {
        blurhash_set = true
        const canvas = document.createElement("canvas");
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext("2d");
        const imageData = ctx.createImageData(w, h);
        if(imageData) {
            imageData.data.set(decoded);
            ctx.putImageData(imageData, 0, 0);
            blurhash_url = canvas.toDataURL()
        }
    }
    */
})

const size = $derived(img_info?.size)
const mimetype = $derived(img_info?.mimetype)
const url = $derived(event?.content?.url)
const alt = $derived(event?.content?.body)


let image = $derived.by(() => {
    // bridged external image
    if(event?.content?.external_url) {
        return event.content.external_url
    }

    let tw = 320
    let th = 240

    if(height >= 320) { 
        tw = 640
        th = 480
    }

    return thumbnailURL(url, tw, th, 'scale')
})

let image_url: string | null = $state(null);

$effect(() => {
    if(store.app.appservice && !authenticated && !image_url) {
        getImage()
    }
    if(store.app.appservice && !authenticated && !full_src) {
        download()
    }
})

async function getImage() {
    if(!event?.content?.url) return
    let w = 320
    let h = 240

    if(height >= 320) { 
        w = 640
        h = 480
    }

    let content_uri = await getImageThumbnail(data.ENV.APPSERVICE_URL, {
        mxcid: event.content.url,
        width: w,
        height: h,
        method: 'scale'
    })
    //let content_uri = await getImageThumbnail(event.content.url, w, h, 'scale')
    if(content_uri) {
        image_url = content_uri
    }
}

let full_src: string | null = $state(null);

async function download() {
    if(!event?.content?.url) return
    let content_uri = await downloadMedia(data.ENV.APPSERVICE_URL, event.content.url)
    if(content_uri) {
        full_src = content_uri
    }
}

let expanded = $state(false)

function expand() {
    expanded = true
}

function kill(e) {
    expanded = false
}

</script>

<div bind:this={el} class="image relative mb-1 bg-img"
style="background-image: url({blurhash_url}); --width: {width}; --height: {height}">
    {#if image || image_url}
    <img 
        onclick={expand}
        src={authenticated ? image : image_url} 
        alt={alt} 
        width={width} 
        height={height} 
        loading="lazy" />
    {/if}
</div>

{#if expanded}
    <ExpandImage src={full_src} {w} {h} {alt} {kill} />
{/if}

<style>
.image {
    overflow: hidden;
    width: calc(var(--width) * 1px);
    height: calc(var(--height) * 1px);
    border-radius: 8px;
}

.image img {
    cursor: pointer;
    border-radius: 8px;
}

</style>

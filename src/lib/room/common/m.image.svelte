<script>
//import { decode } from "blurhash";
import ExpandImage from '$lib/room/common/expand-image.svelte'

import { 
    thumbnailURL,
    processURL,
} from '$lib/utils/matrix'

let {
    event,
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
    let tw = 320
    let th = 240

    if(height >= 320) { 
        tw = 640
        th = 480
    }

    return thumbnailURL(url, tw, th, 'scale')
})

let src = $derived.by(() => {
    return processURL(url)

})

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
    <img 
        onclick={expand}
        src={image} 
        alt={alt} 
        width={width} 
        height={height} 
        loading="lazy" />
</div>

{#if expanded}
    <ExpandImage {src} {w} {h} {alt} {kill} />
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

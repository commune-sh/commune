<script>
import { 
    thumbnailURL,
} from '$lib/utils/matrix'

let {
    event,
} = $props();

const img_info = $derived.by(() => {
    return event?.content?.info
})

const h = $derived(img_info?.h)
const w = $derived(img_info?.w)
const ratio = $derived(h/w)

const size = $derived(img_info?.size)
const mimetype = $derived(img_info?.mimetype)
const url = $derived(event?.content?.url)
const alt = $derived(event?.content?.body)

const width = $derived.by(() => {
    if(w > 320) {
        return 320
    }
    return w
})

const height = $derived.by(() => {
    return width * ratio
})

let image = $derived.by(() => {
    return thumbnailURL(url, 320, 240, 'scale')
})

let full_image = $derived.by(() => {
    return thumbnailURL(url, w, h, 'scale')
})

let expanded = $state(false)

function expand() {
    expanded = true
}

function kill(e) {
    expanded = false
}
</script>

<div class="image relative">
    <img 
        onclick={expand}
        src={image} 
        alt={alt} 
        width={width} 
        height={height} 
        loading="lazy" />
</div>

{#if expanded}
<div class="modal fixed inset-x-0 inset-y-0 bg-mask grid h-full place-items-center" 
    onclick={kill}>
        <div class="p-8">
            <img 
                src={full_image} 
                alt={alt} 
                width={w} 
                height={h} 
                loading="lazy" />
        </div>
</div>
{/if}


<style>
.image {
    overflow: hidden;
}

.image img {
    cursor: pointer;
    max-width: 320px;
    max-height: 240px;
    border-radius: 8px;
}

</style>

<script>
import { 
    processURL,
} from '$lib/utils/matrix'

let {
    event,
} = $props();

let video;

const size = $derived(event?.content?.info?.size)
const duration = $derived(event?.content?.info?.duration/ 1000)
const mimetype = $derived(event?.content?.info?.mimetype)
const url = $derived(event?.content?.url)
const alt = $derived(event?.content?.body)


const src = $derived.by(() => {
    return processURL(url)
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

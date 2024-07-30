<script>
import { 
    processURL,
} from '$lib/utils/matrix'

let {
    event,
} = $props();

let audio;

const size = $derived(event?.content?.info?.size)
const duration = $derived(event?.content?.info?.duration/ 1000)
const mimetype = $derived(event?.content?.info?.mimetype)
const url = $derived(event?.content?.url)
const alt = $derived(event?.content?.body)


const src = $derived.by(() => {
    return processURL(url)
})

</script>

<div class="audio">
    <audio bind:this={audio} 
        src={src} 
        type={mimetype} controls>
    </audio>
</div>


<style>
</style>

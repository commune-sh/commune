<script>
import { createStore } from '$lib/store/store.svelte'
const store = createStore()

import { 
    thumbnailURL,
} from '$lib/utils/matrix'

let {
    event,
    event_user,
} = $props();


const sender = $derived(event?.sender)

const url = $derived.by(() => {
    if(event?.content?.url) {
        return thumbnailURL(event.content.url, 16, 16, 'crop')
    }
})

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

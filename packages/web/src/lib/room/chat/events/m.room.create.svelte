<script>
import { createStore } from '$lib/store/store.svelte'
const store = createStore()

let {
    event,
    event_user,
} = $props();


const sender = $derived(event?.sender)

const topic = $derived.by(() => {
    return event?.content?.topic
})

const has_prev = $derived.by(() => {
    return event?.prev_content?.topic
})

const action = $derived.by(() => {
    return has_prev ? `changed`: `set`
})

</script>

<div class="content-center text-xs">
    {@render event_user()}
    <span class="">
        <span class="text-light">created the room</span>
    </span>
</div>

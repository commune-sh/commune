<script>
import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    event,
    event_user,
} = $props();


const sender = $derived(event?.sender)

const name = $derived.by(() => {
    return event?.content?.name
})

const has_prev = $derived.by(() => {
    return event?.prev_content?.name
})

const action = $derived.by(() => {
    return has_prev ? `changed`: `set`
})

</script>

<div class="content-center text-xs">
    {@render event_user()}
    <span class="">
        <span class="text-light">{action} the room name to </span>
        <span class="">{name}</span>
    </span>
</div>

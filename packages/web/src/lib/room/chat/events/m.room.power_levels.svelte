<script>
import { createStore } from '$lib/store/store.svelte'
const store = createStore()

let {
    event,
    event_user,
} = $props();


const sender = $derived(event?.sender)

</script>

<div class="content-center text-xs">
    {@render event_user()}
    <span class="">
        <span class="text-light">updated the room's permissions.</span>
    </span>
</div>

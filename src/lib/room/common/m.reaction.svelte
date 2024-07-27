<script>
import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    key,
    events,
} = $props();
</script>

<div class="grid grid-cols-[auto_auto] px-1 place-items-center
    bg-shade-3 text-light mr-1 rounded-[4px]">
    <div class="emoji">
        {key}
    </div>
    <div class="text-xs ml-1">
        {events?.length}
    </div>
</div>

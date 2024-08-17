<script>
import { page } from '$app/stores';
import { goto } from '$app/navigation';

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    event,
} = $props();

const replies = $derived.by(() => {
    return event?.unsigned?.["m.relations"]?.["m.thread"]?.count
})

const thread_exists = $derived.by(() => {
    return $page.url.searchParams.get('thread') != undefined
})

let non_space_room = $derived($page.route.id?.includes('/(app)/rooms'))
function toggleThread() {
    let path = `${$page.url.pathname}?thread=${event.event_id}`
    if(thread_exists) {
        path = `${$page.url.pathname}`
    }
    goto(path)
    const location = non_space_room ? 'rooms' : $page.params.space
    store.ui.updateRoute(location, path)
}

</script>

<div class="thread-summary mt-2 p-2 text-sm text-light"
onclick={toggleThread}>
    <div class="text-text font-medium">
        {replies} replies
    </div>
</div>

<style>
.thread-summary {
    display: inline-block;
    border-radius: 4px;
    cursor: pointer;
    background: var(--shade-1);
}
.thread-summary:hover {
    background: var(--shade-2);
}
</style>

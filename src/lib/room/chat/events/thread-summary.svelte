<script>
import { page } from '$app/stores';
import { goto } from '$app/navigation';

import { right } from '$lib/assets/icons'

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

<div class="thread-summary mt-2 py-1 px-2 text-xs text-light"
onclick={toggleThread}>
    <span class="text-text font-medium">
        {replies} replies
    </span>
    <span class="text-primary ml-1">
        View Thread
    </span>
    <span class="icon h-[16px] w-[16px] ml-1">
        {@html right}
    </span>
</div>

<style>
.thread-summary {
    display: inline-block;
    border-radius: 4px;
    cursor: pointer;
    background: var(--shade-3);
}
.thread-summary:hover {
    background: var(--shade-4);
}

.icon {
    display: inline-block;
    vertical-align: middle;
}
</style>

<script>
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { close } from '$lib/assets/icons.js';

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let non_space_room = $derived($page.route.id?.includes('/(app)/rooms'))
function killThread() {
    const path = `${$page.url.pathname}`
    goto(path)
    const location = non_space_room ? 'rooms' : $page.params.space
    store.ui.updateRoute(location, path)
}

</script>

<div class="thread-header border-solid border-b border-border 
    grid grid-cols-[auto_1fr_auto] items-center">

    <div class="ml-2 font-semibold">
        Thread
    </div>

    <div class="">
    </div>

    <div class="mr-4">
        <div onclick={killThread} 
            class="icon cursor-pointer h-[22px] w-[22px]">
            {@html close}
        </div>
    </div>

</div>

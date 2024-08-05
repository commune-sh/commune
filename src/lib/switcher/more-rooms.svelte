<script>
import { stack } from '$lib/assets/icons'
import { goto } from '$app/navigation';
import { page } from '$app/stores';

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let el;

function goToRooms() {
    const route = store.ui.getRoute('rooms')
    console.log(route)
    if($page.url.pathname == route) {
        goto(`/rooms`)
        return
    }
    if(route) {
        goto(route)
        return
    }
    goto(`/rooms`)
}

</script>

<div class="grid relative place-items-center my-[20px]" 
onclick={goToRooms}>
    <div bind:this={el} class="cursor-pointer stroke w-[1.6rem] h-[1.6rem]" >
        {@html stack}
    </div>
</div>

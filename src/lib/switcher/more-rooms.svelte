<script>
import { ellipsis } from '../assets/icons'
import { goto } from '$app/navigation';
import { page } from '$app/state';

import { tooltip } from '../tooltip/tooltip'

import { createStore } from '../store/store.svelte'
const store = createStore()

let el;

function goToRooms() {
    const route = store.ui.getRoute('rooms')
    console.log(route)
    if(page.url.pathname == route) {
        goto(`/rooms`)
        return
    }
    if(route) {
        goto(route)
        return
    }
    goto(`/rooms`)
}

let active = $derived(page.route.id?.includes('/(app)/rooms'))

const options = $derived.by(() => {
    return {
        content: `More Rooms`,
        placement: 'right',
        offset: [0, 16]
    }
})

</script>

<div class="grid relative place-items-center my-[20px]" >
    <div bind:this={el} 
    onclick={goToRooms}
    use:tooltip={options}
        class:bg-cmn-7={active}
        class="item grid place-items-center cursor-pointer 
        bg-cmn-4 hover:bg-cmn-7 rounded-[14px]
        w-[40px] h-[40px]" >
        <div class="more w-[1.6rem]">
            {@html ellipsis}
        </div>
    </div>
    <div class="pill opacity-0 absolute left-[0px] w-[4px] top-[16px] bottom-[16px]
        bg-pill duration-100"
        class:opacity-100={active}>
    </div>
</div>

<style>
.item:hover + .pill {
    opacity: 0.8;
} 

.pill {
    border-radius: 0 4px 4px 0;
}

</style>

<script>
import { ellipsis } from "$lib/assets/icons";
import { clickOutside } from '$lib/utils/utils'

import { createStore } from '$lib/store/store.svelte'
const store = createStore()

let {
    event,
} = $props();


let active = $derived.by(() => {
    return store.ui.event_menu?.active &&
        store.ui.event_menu?.event?.event_id == event?.event_id
})

function toggle(e) {
    e.stopPropagation()
    if(!active) {
        store.ui.updateEventMenu(event)
    } else {
        store.ui.killEventMenu()
    }
}

function kill() {
    store.ui.killEventMenu()
}

</script>

<div class="more relative"
    use:clickOutside={kill}
    class:active={active}
    onclick={toggle}>
    <div class="icon h-[20px] w-[20px]">
        {@html ellipsis}
    </div>

</div>


<style>
.more {
}
.active {
    background: var(--cmn-1);
}
</style>

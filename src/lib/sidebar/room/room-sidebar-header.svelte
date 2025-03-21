<script>
import { page } from '$app/stores';
import { 
    get_local_part,
    processURL,
} from '$lib/utils/matrix'

import { createStore } from '$lib/store/store.svelte'
const store = createStore()

const space = $derived(store.matrix.active_space)

const name = $derived.by(() => {
    if(space?.name) {
        return space.name
    }
    if(space?.canonical_alias) {
        return get_local_part(space.canonical_alias)
    }
    return space?.room_id
})

const space_state = $derived.by(() => {
    return store.matrix.room_state[space?.room_id]
})

const banner = $derived.by(() => {
    const url = space_state?.find(r => r.type == 'commune.room.banner')?.content?.url
    if(url) {
        return processURL(url)
    }
    return null
})

</script>

<div class="sidebar-header grid 
    bg-header border-solid border-b border-border bg-img"
    class:h-[52px]={!banner}
    class:h-[130px]={banner}
    style="background-image: url({banner})"
>
    <div class="flex mx-2 "
    class:items-center={!banner}
    class:mt-2={banner}>
        <div class="font-bold px-2 py-1">
            {name}
        </div>
        <div class="">
        </div>
        <div class="">
        </div>
    </div>
</div>

<style>
.sidebar-header {
}
</style>

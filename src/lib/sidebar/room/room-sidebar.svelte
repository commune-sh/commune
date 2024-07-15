<script>
import { page } from '$app/stores';
import { naiveRoomIDCheck, full_alias } from '$lib/utils/matrix'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const rooms = $derived.by(() => {
    return store.matrix.rooms
})

const is_alias = $derived.by(() => {
    return !naiveRoomIDCheck($page.params.space)
})

const items = $derived.by(() => {
    if(is_alias) {
        const alias = full_alias($page.params.space)
        let i = rooms.filter(room => room.canonical_alias == alias)[0]
        if(i?.children?.length > 0) {
            let items = []
            i.children.forEach(child => {
                let item = rooms.find(room => room.room_id == child)
                if(!item?.children) {
                    items.push(item)
                }
            })
            return items
        }
    }
})

</script>

<div class="sidebar-container">
{#each items as item}
    <div>{item.name}</div>
{/each}
</div>


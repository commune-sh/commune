<script>
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { is_local_room, get_local_part } from '$lib/utils/matrix'

let {
    item
} = $props();


function log(e) {
    e.preventDefault()
    console.log(item)
}

const is_local = $derived.by(() => {
    return is_local_room(item?.room_id)
})

function goToRoom() {
    goto(`/${$page.params.space}/${item.origin_server_ts}`)
}

const active = $derived.by(() => {
    return item?.origin_server_ts == $page.params.room
})

</script>

<div class="cursor-pointer"
    class:active={active}
    onclick={goToRoom} oncontextmenu={log}>
    {item.name}
</div>

<style>
.active {
    color: red;
}
</style>

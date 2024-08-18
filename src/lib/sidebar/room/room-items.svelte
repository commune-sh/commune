<script>
import RoomItem from '$lib/sidebar/room/room-item.svelte'
let {
    items
} = $props();

const sorted = $derived.by(() => {
    return items?.sort((a, b) => {
        return a.origin_server_ts - b.origin_server_ts
    })
})

let processed = $state(null);

$effect(() => {
    if(sorted) {
        processed = sorted
        //console.log("Built rooms:", $state.snapshot(processed))
    }
})

</script>

{#if processed}
    <div class="room-items mt-2">
        {#each processed as item (item.room_id)}
            <RoomItem {item} />
        {/each}
    </div>
{/if}

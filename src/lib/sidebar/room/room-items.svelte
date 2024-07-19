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

</script>

{#if sorted}
<div class="room-items mt-2">
    {#each sorted as item}
        <RoomItem {item} />
    {/each}
</div>
{/if}

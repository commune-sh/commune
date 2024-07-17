<script>
import RoomItem from '$lib/sidebar/room/room-item.svelte'
let {
    items
} = $props();
</script>

{#if items}
{#each items as item}
    <RoomItem {item} />
{/each}
{/if}

<script lang="ts">
import RoomItem from './room-item.svelte'

import type { Data } from '../../types/common'

let {
    data,
    items
}: {
    data: Data,
    items: any[]
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
            <RoomItem {data} {item} />
        {/each}
    </div>
{/if}

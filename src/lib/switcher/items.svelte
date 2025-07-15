<script lang="ts">
import Item from './item.svelte'
import { onMount } from 'svelte'
import SkeletonItems from '../skeleton/switcher-items.svelte'
import { buildSpaces, strayRooms } from '../utils/matrix'

import MoreRooms from './more-rooms.svelte'


import type { Data } from '../types/common'

let {
    data,
}: {
    data: Data,
} = $props();


// app store
import { createStore } from '../store/store.svelte'
const store = createStore()

const homeserver_reachable = $derived(store.app.homeserver_reachable)

const authenticated = $derived(store.session.authenticated)


let items = $derived.by(() => {
    return store.matrix.spaces;
})

let stray_rooms = $derived.by(() => {
    return store.matrix.rooms ? strayRooms(store.matrix.rooms) : null
})


function move(from, to) {
    const element = items.splice(from, 1)[0]; 
    items.splice(to, 0, element);
}

// item being dragged over
let dragged_over = $state(null);

// item started to move
function over(index) {
    dragged_over = index;
}

// kill move state
function end() {
    dragged_over = null;
    dragged = null;
    clientY = null;
}

let dragged = $state(null);

function start(index) {
    dragged = index;
}

let clientY = $state(null);

function update(cy) {
    clientY = cy;
}

function scroll(e) {
    console.log(e)
}

function showContextMenu(e) {
    e.preventDefault()
}

</script>

<div class="grid grid-rows-[1fr_auto] overflow-hidden">

    <div class="items overflow-hidden">
        <div class="space-items overflow-y-auto h-full hide-scroll pt-[10px]"
        oncontextmenu={showContextMenu}>
        {#if items}
            {#each Object.values(items) as space, index (space?.room_id)}
                <Item {data} {space} {dragged_over} {dragged} {index} {clientY}
                move={move} 
                over={over} 
                start={start} 
                update={update}
                end={end} />
            {/each}

        {:else}
            <SkeletonItems />
        {/if}
        </div>


    </div>



    <div class="">

    </div>
</div>

<style>
</style>

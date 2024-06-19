<script lang="ts">
import Item from './item.svelte'
import { onMount } from 'svelte'
import SkeletonItems from '$lib/skeleton/switcher-items.svelte'

// app store
import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

import { getPublicRooms } from '$lib/public_server/requests'

const public_server_reachable = $derived(store.public_server_reachable)

// auth store
import { createAuthStore } from '$lib/store/auth.svelte.js'
const authStore = createAuthStore()
const authReady = $derived(authStore.ready)
const authenticated = $derived(authStore.authenticated)


let spaces = $derived(store.spaces)

let items = $derived(spaces)

$effect(() => {
    if(authReady && !authenticated && public_server_reachable) {
        console.log("fetching public rooms")
        fetchPublicRooms()
    }
})

async function fetchPublicRooms() {
    const resp = await getPublicRooms()
    if(resp?.chunk?.length > 0) {
        //items = rooms
        store.updateSpaces(resp.chunk)
    }
    public_rooms_fetched = true
}

let public_rooms_fetched = $state(false)


onMount(() => {
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

let hovered = $state(false);

function hover() {
    hovered  = true
}

let clientY = $state(null);

function update(cy) {
    clientY = cy;
}

</script>

<div class="grid grid-rows-[1fr_auto] overflow-hidden">

    <div class="items overflow-hidden"
        onmouseleave={() => hovered = false}
    >
        <div class="overflow-y-auto h-full hide-scroll pt-[6px]">
        {#if public_rooms_fetched}
            {#each items as space, index (space?.id ?? index)}
                <Item {space} {dragged_over} {dragged} {hovered} {index} {clientY}
                move={move} 
                over={over} 
                start={start} 
                hover={hover}
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

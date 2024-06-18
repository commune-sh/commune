<script lang="ts">
import Item from './item.svelte'
import { onMount } from 'svelte'
import SkeletonItems from '$lib/skeleton/switcher-items.svelte'

import { createStore } from '$lib/store/store.svelte.js'

import { getPublicRooms } from '$lib/public_server/requests'

const store = createStore()

const public_server_reachable = $derived(store.public_server_reachable)

// auth store
import { createAuthStore } from '$lib/store/auth.svelte.js'
const authStore = createAuthStore()
const authReady = $derived(authStore.ready)
const authenticated = $derived(authStore.authenticated)

let items = $state(null)

$effect(() => {
    if(authReady && !authenticated && public_server_reachable) {
        console.log("fetching public rooms")
        fetchPublicRooms()
    }
    if(authReady && !authenticated && !public_server_reachable) {
        public_rooms_fetched = true
    }
})

async function fetchPublicRooms() {
    const rooms = await getPublicRooms()
    console.log(rooms)
    if(rooms?.length > 0) {
        items = rooms
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

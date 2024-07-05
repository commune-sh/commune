<script lang="ts">
import Item from './item.svelte'
import { onMount } from 'svelte'
import SkeletonItems from '$lib/skeleton/switcher-items.svelte'

// app store
import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

import { getPublicRooms } from '$lib/appservice/requests'

const homeserver_reachable = $derived(store.app.homeserver_reachable)
const appservice_reachable = $derived(store.app.appservice_reachable)

const authReady = $derived(store.auth.ready)
const authenticated = $derived(store.auth.authenticated)

let spaces = $derived(store.matrix.spaces)

let no_items = $derived(spaces?.length === 0)

let items = $derived(spaces)

$effect(() => {
    if(authReady && !authenticated) {
        console.log("fetching public rooms")
        fetchPublicRooms()
    }
})

async function fetchPublicRooms() {
    const resp = await getPublicRooms()
    if(resp?.chunk?.length > 0) {
        //items = rooms
        store.matrix.updateSpaces(resp.chunk)
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

let clientY = $state(null);

function update(cy) {
    clientY = cy;
}

</script>

<div class="grid grid-rows-[1fr_auto] overflow-hidden">

    <div class="items overflow-hidden">
        <div class="overflow-y-auto h-full hide-scroll pt-[10px]">
        {#if !no_items}
            {#each items as space, index (space?.id ?? index)}
                <Item {space} {dragged_over} {dragged} {index} {clientY}
                move={move} 
                over={over} 
                start={start} 
                update={update}
                end={end} />
            {/each}
        {:else if homeserver_reachable}
            <SkeletonItems />
        {/if}
        </div>

    </div>



    <div class="">

    </div>
</div>

<style>
</style>

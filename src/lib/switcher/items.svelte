<script lang="ts">
import Item from './item.svelte'
import { onMount } from 'svelte'
import SkeletonItems from '$lib/skeleton/switcher-items.svelte'
import { buildSpaces, strayRooms } from '$lib/utils/matrix'

import MoreRooms from '$lib/switcher/more-rooms.svelte'

// app store
import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

import { getPublicRooms } from '$lib/appservice/requests'

const homeserver_reachable = $derived(store.app.homeserver_reachable)
const appservice_reachable = $derived(store.app.appservice_reachable)

const authReady = $derived(store.auth.ready)
const authenticated = $derived(store.auth.authenticated)



//let items = $derived(spaces)

let items = $derived.by(() => {
    return store.matrix.rooms ? buildSpaces(store.matrix.rooms) : null
})

let stray_rooms = $derived.by(() => {
    return store.matrix.rooms ? strayRooms(store.matrix.rooms) : null
})


$effect(() => {
    if(authReady && !authenticated) {
        //console.log("fetching public rooms")
        //fetchPublicRooms()
    }
})


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

function scroll(e) {
    console.log(e)
}

</script>

<div class="grid grid-rows-[1fr_auto] overflow-hidden">

    <div class="items overflow-hidden">
        <div class="overflow-y-auto h-full hide-scroll pt-[10px]">
        {#if items}
            {#each Object.values(items) as space, index (space?.id ?? index)}
                <Item {space} {dragged_over} {dragged} {index} {clientY}
                move={move} 
                over={over} 
                start={start} 
                update={update}
                end={end} />
            {/each}

            {#if stray_rooms?.length > 0}
                    <MoreRooms />
            {/if}

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

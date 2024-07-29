<script>
import { page } from '$app/stores';
import { onMount, tick } from 'svelte'

import ViewPort from '$lib/room/chat/chat-viewport.svelte'

import Composer from '$lib/composer/composer.svelte'

import Event from '$lib/room/chat/events/event.svelte'

import SkeletonChatEvents from '$lib/skeleton/chat-events.svelte'


import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()


const room = $derived(store.matrix.active_room)
const state = $derived(store.matrix.active_room_state)

//const events = $derived(store.matrix.active_room_events)

const events = $derived.by(() => {
  return store.matrix.events[room?.room_id]?.events
})

$effect(() => {
    if(events) {
    }
})

let composer;


let ready = $state(false)

</script>



{#if events}


<div class="chat-view relative grid grid-rows-[1fr_auto] overflow-hidden h-full">

    <ViewPort {events} {room} />

    <div class="composer-container">
        <Composer bind:this={composer} />
    </div>

</div>

{:else}
    <SkeletonChatEvents />
{/if}


<style>
</style>

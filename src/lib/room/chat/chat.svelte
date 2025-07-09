<script lang="ts">
import { page } from '$app/state';
import { onMount, tick } from 'svelte'

import ViewPort from '../chat/chat-viewport.svelte'

import Composer from '../../composer/composer.svelte'

import SkeletonChatEvents from '../../skeleton/chat-events.svelte'

import type { Data } from '../../types/common'

let {
    data,
}: {
    data: Data
} = $props();

import { createStore } from '../../store/store.svelte'
const store = createStore()


const room = $derived(store.matrix.active_room)
const state = $derived(store.matrix.active_room_state)

//const events = $derived(store.matrix.active_room_events)

const events = $derived.by(() => {
  return store.matrix.events[room?.room_id]?.events
})

let composer;

let ready = $state(false)

</script>



{#if events}


<div class="chat-view relative grid grid-rows-[1fr_auto] overflow-hidden h-full">

    <ViewPort {data} {events} {room} />

    <div class="composer-container">
        <Composer {data} bind:this={composer} />
    </div>

</div>

{:else}
    <SkeletonChatEvents />
{/if}


<style>
</style>

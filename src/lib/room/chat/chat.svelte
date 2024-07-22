<script>
import { page } from '$app/stores';
import { onMount, tick } from 'svelte'

import Loading from '$lib/loading/loading.svelte'
import Composer from '$lib/composer/composer.svelte'

import Event from '$lib/room/chat/events/event.svelte'

import { debounce } from '$lib/utils/utils'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const rooms = $derived(store.matrix.rooms)
const room_state = $derived(store.matrix.room_state)

const room = $derived(store.matrix.active_room)

const state = $derived.by(() => {
    return room_state[room?.room_id]
})

const messages = $derived.by(() => {
    return store.matrix.messages[room?.room_id]?.events
})

let count = $derived(store.ui.getMessageCount(room?.room_id))

$effect(async () => {

    // set initial scroll position 
    if(messages && vp && !count) {
        await tick();
        vp.scrollTop = vp.scrollHeight
        store.ui.setMessageCount(room.room_id, messages.length)
    }

    // reset position when room changed
    if(messages && vp && count == messages.length) {
        const scrollPosition = store.ui.scrollPosition[room.room_id]
        if(scrollPosition) {
            await tick();
            vp.scrollTop = scrollPosition
        }
    }

    if(messages && vp && count != messages.length) {
        console.log("calc")
        const s = vp.scrollHeight - (vp.scrollTop + vp.clientHeight)
        if(s < 100) {
            await tick();
            vp.scrollTop = vp.scrollHeight
        }
        setTimeout(() => {
            store.ui.setMessageCount(room.room_id, messages.length)
        }, 700)
    }
})


let vp;

function setScrollPosition(e) {
    debounce(() => {
        let st = vp.scrollTop
        if(count != messages.length) {
            setTimeout(() => {
                store.ui.updateScrollPosition(room.room_id, st)
            }, 100)
        } else {
            store.ui.updateScrollPosition(room.room_id, st)
        }
    }, 300)
}

const new_room = $derived.by(() => {
    return messages[0].type == 'm.room.create'
})

let ob;
let scrollHeight = $state(0);

function setupObserver() {
    scrollHeight = vp?.scrollHeight;

    let sc = scrollHeight / 2

    let options = {
        root: vp,
        rootMargin: `400px`,
    };

    let callback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && messages?.length >= 50) {
                store.matrix.fetchRoomMessages({
                    room_id: room.room_id,
                })
            }
        });
    };

    let observer = new IntersectionObserver(callback, options);
    observer.observe(ob);
}

onMount(() => {
    setTimeout(() => {
        setupObserver()
    }, 1000)
})

</script>


{#if messages}


<div class="chat-view grid grid-rows-[1fr_auto] overflow-hidden h-full">
    <div class="chat-content h-full overflow-y-auto overflow-x-hidden"
        onscroll={setScrollPosition}
        bind:this={vp}>
        <div class="chat-events p-4 flex flex-col h-full">
            <div class="filler flex-grow">
            </div>

            <div class="ob" bind:this={ob}></div>

            {#each messages as event, event_id (event.event_id)}

                <Event {event} {event_id}/>

            {/each}
        </div>
    </div>

    <Composer />

</div>

{:else}
    <Loading />
{/if}


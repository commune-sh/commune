<script>
import { page } from '$app/stores';
import { onMount, tick } from 'svelte'

import ViewPort from '$lib/room/chat/viewport.svelte'

import Composer from '$lib/composer/composer.svelte'

import Event from '$lib/room/chat/events/event.svelte'

import SkeletonChatEvents from '$lib/skeleton/chat-events.svelte'


import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const rooms = $derived(store.matrix.rooms)
const room_state = $derived(store.matrix.room_state)

const room = $derived(store.matrix.active_room)

const state = $derived.by(() => {
    return room_state[room?.room_id]
})

const events = $derived(store.matrix.active_room_events)

let count = $derived(store.ui.getMessageCount(room?.room_id))

$effect(async () => {

    // set initial scroll position 
    if(events && vp && !count) {
        await tick();
        vp.scrollTop = vp.scrollHeight - vp.clientHeight
        store.ui.setMessageCount(room.room_id, events.length)
    }

    /*
    // reset position when room changed
    if(events && vp && count == events.length) {
        const scrollPosition = store.ui.scrollPosition[room.room_id]
        if(scrollPosition) {
            await tick();
            vp.scrollTop = scrollPosition
        }
    }

    if(events && vp && count != events.length) {
        console.log("calc")
        const s = vp.scrollHeight - (vp.scrollTop + vp.clientHeight)
        if(s < 100) {
            await tick();
            vp.scrollTop = vp.scrollHeight
        }
        setTimeout(() => {
            store.ui.setMessageCount(room.room_id, events.length)
        }, 700)
    }
    */

    if(fetchingMore) {
        store.matrix.fetchRoomMessages({
            room_id: room.room_id,
        })
        fetchingMore = false
    }

    if(events && count != events.length) {
        const pos = store.ui.scrollPosition[room.room_id]
            console.log("pos is", pos)
        if(pos) {
            await tick();
            vp.scrollTop = vp.scrollHeight - pos.scrollHeight 
        }

        store.ui.setMessageCount(room.room_id, events.length)
    }
})


let vp;

function setScrollPosition(e) {
    let opts = {
        scrollTop: vp.scrollTop,
        scrollHeight: vp.scrollHeight
    }
    store.ui.updateScrollPosition(room.room_id, opts)
    /*
    debounce(() => {
        let st = vp.scrollTop
        if(!fetchingMore) {
        store.ui.updateScrollPosition(room.room_id, st)
        }
    }, 350)
    debounce(() => {
        let st = vp.scrollTop
        if(count != events.length) {
            setTimeout(() => {
                store.ui.updateScrollPosition(room.room_id, st)
            }, 100)
        } else {
            store.ui.updateScrollPosition(room.room_id, st)
        }
    }, 300)
    */
}

const new_room = $derived.by(() => {
    return events?.[0].type == 'm.room.create'
})

let ob;
let observer = null;
let scrollHeight = $state(0);

let fetchingMore = $state(false);

function setupObserver() {
    scrollHeight = vp?.scrollHeight;

    let sc = scrollHeight / 2

    let options = {
        root: vp,
        rootMargin: `0px`,
    };

    let callback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !fetchingMore) {
                fetchingMore = true
                /*
                store.matrix.fetchRoomMessages({
                    room_id: room.room_id,
                })
                */
            }
        });
    };

    observer = new IntersectionObserver(callback, options);
    observer.observe(ob);
    console.log("set up observer")
}

let _active_room = $state(null);

onMount(() => {
        setTimeout(() => {
            setupObserver()
        }, 1000)
})

let composer;

$effect(() =>{
    if(room && !_active_room) {
        _active_room = room.room_id
        focusComposer()
    }
    if(room && (_active_room != room.room_id)) {
        // do things here when active room changes
        _active_room = room.room_id
        composer.focus()
    }

    if(events) {
        //console.log("active room events are ", events)
    }
})

function focusComposer() {
    console.log("ok")
    if(composer) {
        composer.focus()
    }
}


</script>



{#if events}


<div class="chat-view relative grid grid-rows-[1fr_auto] overflow-hidden h-full">
    <div class="chat-content h-full overflow-y-auto overflow-x-hidden lg:mr-1"
        onscroll={setScrollPosition}
        bind:this={vp}>
        <div class="chat-events flex flex-col h-full">

            <div class="filler flex-grow">
            </div>

            <div class="ob" bind:this={ob}></div>

            {#if fetchingMore}
                <div class="fetching grid justify-center items-center">
                    <div class="spinner spinner-lg"></div>
                </div>
            {/if}

            {#each events as event, index (event.event_id)}

                <Event {event} {index}/>

            {/each}

            <div class="sep py-2">
            </div>
        </div>
    </div>

    <Composer bind:this={composer} />

</div>

{:else}
    <SkeletonChatEvents />
{/if}


<style>
.fetching {
    min-height: 60px;
}
</style>

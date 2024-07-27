<script>
import Event from '$lib/room/chat/events/event.svelte'

import { debounce } from '$lib/utils/utils'
import { onMount, tick } from 'svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    events,
    room
} = $props();

let count = $derived(store.ui.getMessageCount(room?.room_id))

const position = $derived.by(() => {
    return store.ui.scrollPosition[room?.room_id]
})

let viewport;

$effect(() => {

    if(viewport && !count) {
        console.log("Setting initial scroll position")
        tick().then(() => {
            viewport.scrollTop = viewport.scrollHeight - viewport.clientHeight
        });
        store.ui.setMessageCount(room.room_id, events.length)
    }

    if(viewport && count && count == events?.length && !fetchingMore) {
        tick().then(() => {
            viewport.scrollTop = position.scrollTop
        });
    }


    if(viewport && count && count != events?.length) {
        tick().then(() => {
            viewport.scrollTop = viewport.scrollHeight - position.scrollHeight
        });
    }




    /*
    // set initial scroll position 

    // reset position when room changed

    if(events && viewport && count != events.length) {
        console.log("calc")
        const s = viewport.scrollHeight - (viewport.scrollTop + viewport.clientHeight)
        if(s < 100) {
            await tick();
            viewport.scrollTop = viewport.scrollHeight
        }
        setTimeout(() => {
            store.ui.setMessageCount(room.room_id, events.length)
        }, 700)
    }
    */

    if(fetchingMore) {
        observer.unobserve(ob)
        fetchingMore = false
        store.matrix.fetchRoomMessages({
            room_id: room.room_id,
        })
            store.ui.setMessageCount(room.room_id, events.length)
        setTimeout(() => {
            setScrollPosition()
            observer.observe(ob)
        }, 200)
    }

})



function setScrollPosition(e) {
    // don't set scroll position if count exists
    if(fetchingMore) return
    if(count != events?.length) return
    debounce(() => {
        let opts = {
            scrollTop: viewport.scrollTop,
            scrollHeight: viewport.scrollHeight
        }
        tick().then(() => {
            store.ui.updateScrollPosition(room.room_id, opts)
        });
    }, 10)
}


let ob;
let observer = null;
let observer_active = $state(false);


let fetchingMore = $state(false);

function setupObserver() {

    if(observer) {
        observer.disconnect()
        observer = null
    }

    let options = {
        root: viewport,
        rootMargin: `0px`,
    };

    let callback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !fetchingMore) {
                fetchingMore = true
            }
        });
    };

    observer = new IntersectionObserver(callback, options);
    observer.observe(ob);
    console.log("Viewport observer set.")
}

let _active_room = $state(null);

let composer;

$effect(() =>{
    if(room && (_active_room != room.room_id)) {
        // do things here when active room changes
        _active_room = room.room_id

        setTimeout(() => {
            //setupObserver()
        }, 1000)
    }

    if(ob && !observer_active) {
        observer_active = true
        setTimeout(() => {
            setupObserver()
        }, 100)
    }
})
</script>

<div class="chat-content h-full overflow-y-auto overflow-x-hidden lg:mr-1"
    onscroll={setScrollPosition}
    bind:this={viewport}>
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

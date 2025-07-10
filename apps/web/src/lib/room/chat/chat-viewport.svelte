<script lang="ts">
import { page } from '$app/state';

import Event from '../chat/events/event.svelte'

import { debounce } from '../../utils/utils'
import { onMount, tick } from 'svelte'

import ScrollToBottom from '../chat/components/scroll-to-bottom.svelte'

import { createStore } from '../../store/store.svelte'
const store = createStore()

import type { Data } from '../../types/common'

let {
    data,
    events,
    room,
    thread_view = false,
}: {
    data: Data,
    events: any[],
    room: any,
    thread_view?: boolean
} = $props();

const prefix = $derived.by(() => {
    return thread_view ? `thread-${room?.room_id}` : `room-${room?.room_id}` 
})

let count = $derived(store.ui.getMessageCount(prefix))

const position = $derived.by(() => {
    return store.ui.scrollPosition[prefix]
})

let viewport;

const context_event = $derived.by(() => {
    const url_event = page.url.searchParams.get('event');
    if(url_event) return events.find(e => e.event_id == url_event)
    return null
})

const showScrollToBottom = $derived.by(() => {
    return position && (position?.scrollHeight - (position?.scrollTop +
    position?.clientHeight) > 200)
})

function scrollToBottom() {
    viewport.scrollTop = viewport.scrollHeight
}

$effect(() => {

    if(viewport && !count) {
        if(context_event) {
            tick().then(() => {
                const el = document.querySelector(`[data-event-id="${context_event.event_id}"]`)
                if(el) {
                    el.scrollIntoView({block: "center", inline: "nearest"})
                }
            });
            return
        }
        console.log("Setting initial scroll position")
        tick().then(() => {
            viewport.scrollTop = viewport.scrollHeight - viewport.clientHeight
        });
        store.ui.setMessageCount(prefix, events?.length)
    }

    if(viewport && count && count == events?.length && !fetchingMore) {
        tick().then(() => {
            if(position?.scrollTop) {
                viewport.scrollTop = position.scrollTop
            }
        });
    }


    if(viewport && count && count != events?.length) {
        tick().then(() => {
            viewport.scrollTop = viewport.scrollHeight - position.scrollHeight
            store.ui.setMessageCount(prefix, events.length)
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

})

let last_reached = $derived.by(() => {
    return events && events[0]?.type == 'm.room.create'
})

async function fetchMore() {
    observer.unobserve(ob)
    fetchingMore = false

    try {
        const done = store.matrix.fetchRoomMessages({
            room_id: room.room_id,
        })

        store.ui.setMessageCount(prefix, events.length)

        if(done) {
            setTimeout(() => {
                setScrollPosition()
                if(ob && observer) {
                    observer.observe(ob)
                }
            }, 3000)
        }
    } catch(e) {
        console.error(e)
    }
}



function setScrollPosition(e) {
    // don't set scroll position if count exists
    if(fetchingMore) return
    if(count != events?.length) return
    debounce(() => {
        let opts = {
            scrollTop: viewport.scrollTop,
            scrollHeight: viewport.scrollHeight,
            clientHeight: viewport.clientHeight
        }
        tick().then(() => {
            store.ui.updateScrollPosition(prefix, opts)
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
            if (entry.isIntersecting && !fetchingMore && !last_reached) {
                fetchingMore = true
                fetchMore()
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

        <div class="ob" bind:this={ob}>
        </div>

        {#if fetchingMore}
            <div class="fetching grid justify-center items-center">
                <div class="spinner spinner-lg"></div>
            </div>
        {/if}

        {#if events}
            {#each events as event, index (event.event_id)}

                <Event {data} {event} {index} {thread_view}/>

            {/each}
        {/if}

        <div class="sep py-2">
        </div>
    </div>

    {#if showScrollToBottom}
        <ScrollToBottom {scrollToBottom} />
    {/if}
</div>

<style>
::-webkit-scrollbar-thumb {
    background: transparent;
}

.chat-content:hover::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
}

</style>

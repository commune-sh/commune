<script>
import { page } from '$app/stores';
import { tick } from 'svelte'

import Loading from '$lib/loading/loading.svelte'
import Composer from '$lib/composer/composer.svelte'

import ChatEvent from '$lib/room/chat/chat-event.svelte'

import { debounce } from '$lib/utils/utils'

import { 
    naiveRoomIDCheck
} from '$lib/utils/matrix'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const rooms = $derived(store.matrix.rooms)
const room_state = $derived(store.matrix.room_state)

const room = $derived.by(() => {
    const is_room_id = naiveRoomIDCheck($page.params.room)
    const key = is_room_id ? `room_id` : `origin_server_ts`
    return rooms?.filter(r => r[key] == $page.params.room)[0]
})

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

function log(e) {
    e.preventDefault()
}

function setScrollPosition(e) {
    debounce(() => {
        let st = vp.scrollTop
        if(st == 0) { st = 1 }
        if(count != messages.length) {
            setTimeout(() => {
                store.ui.updateScrollPosition(room.room_id, st)
            }, 100)
        } else {
            store.ui.updateScrollPosition(room.room_id, st)
        }
    }, 300)
}

</script>

{count}

{#if messages}


<div class="chat-view grid grid-rows-[1fr_auto] overflow-hidden h-full">
    <div class="chat-content h-full overflow-y-auto overflow-x-hidden"
        oncontextmenu={log}
        onscroll={setScrollPosition}
        bind:this={vp}>
        <div class="chat-events p-4 flex flex-col h-full">
            <div class="filler flex-grow">
            </div>
            {#each messages as event, event_id (event.event_id)}

                <ChatEvent {event} {event_id}/>

            {/each}
        </div>
    </div>

    <Composer />

</div>

{:else}
    <Loading />
{/if}


<script>
import { onMount } from 'svelte'
import { page } from '$app/stores';

import ThreadHeader from '$lib/thread/thread-header.svelte'
import ThreadContent from '$lib/thread/thread-content.svelte'

import ViewPort from '$lib/room/chat/chat-viewport.svelte'

import { getSetting, updateSetting } from '$lib/utils/localstorage';
let saved_width = $derived.by(() => {
    return getSetting('thread_width');
});

import { createStore } from '$lib/store/store.svelte'
const store = createStore()

let width = $state(saved_width || 300);

let resizing = $state(false);

let startX = $state(0);

const start = (e) => {
    resizing = true;
    startX = e.clientX;
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', done);
};

const resize = (e) => {
    if(resizing) {
        const deltaX = e.clientX - startX;
        if(deltaX > 0 && width <= 300) return;
        if(deltaX < 0 && width >= 600) return;
        width += -(deltaX)
        startX = e.clientX;
    }
};

const done = () => {
    resizing = false;
    updateSetting('thread_width', width);
    window.removeEventListener('mousemove', resize);
    window.removeEventListener('mouseup', done);
};

$effect(() => {
    if(resizing) {
        document.body.classList.add('resize-cursor');
    } else {
        document.body.classList.remove('resize-cursor');
    }
})

const thread = $derived.by(() => {
    return $page.url.searchParams.get('thread') 
})

const room = $derived(store.matrix.active_room)

const events = $derived.by(() => {
    const items = store.matrix.events[room?.room_id]?.events
    if(items) {
        return items.filter(e => e.event_id == thread ||
            e.content['m.relates_to']?.['rel_type'] ===
        'm.thread' && e.content['m.relates_to']?.['event_id'] === thread)
    }
})

$effect(() =>{
    if(events) {
        console.log("thread events found", events)
    }
})

onMount(() => {
    const thread_events = store.matrix.thread_events[thread]
    if(!thread_events) {
        console.log("Fetching thread events...")
    }
})



</script>

<div class="thread-container relative grid bg-background h-dvh">
    <div class="thread h-dvh grid grid-rows-[52px_1fr] border-solid border-l border-border"
        style="--width: {width};">

        <ThreadHeader />

        <div class="thread-content overflow-hidden">
            <ViewPort {events} {room} thread_view={true} />
        </div>

    </div>

    <div class="dragger absolute grid place-items-center" 
        class:resizing={resizing}
        onmousedown={start}>
        <div class="holder" >
        </div>
    </div>

</div>

<style>

.dragger {
    width: 11px;
    left: -6px;
    top: 0;
    bottom: 0;
    cursor: col-resize;
    border-radius: 1px;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 10;
}

.resizing {
    opacity: 1;
}

.dragger:hover {
    opacity: 1;
}

.holder {
    height: 4rem;
    width: 6px;
    border-radius: 6px;
    background: var(--dragger);
    margin-left: 2px;
    z-index: 12;
}

.thread {
    width: calc(var(--width) * 1px);
}

@media (max-width: 768px) {
    .thread-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
    }
    .thread {
        width: 100%;
    }
}
</style>




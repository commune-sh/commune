<script>
import More from '$lib/event/menu/more/more.svelte'
import Actions from '$lib/event/menu/more/actions.svelte'
import Download from '$lib/event/menu/download/download.svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    event,
    killHover,
} = $props();

const m_file = $derived.by(() => {
    return event?.content?.msgtype == 'm.file'
})

let more_active = $derived.by(() => {
    return store.ui.event_menu?.active &&
        store.ui.event_menu?.event?.event_id == event?.event_id
})

function click() {
    store.ui.killEventMenu()
    killHover()
}

</script>

<div class="event-menu flex bg-view relative select-none"
onclick={click}>
    {#if m_file}
        <Download {event}/>
    {/if}

    <More {event}/>

    {#if more_active}
        <Actions {event} />
    {/if}

</div>

<style>
.event-menu {
    position: absolute;
    top: -0.6rem;
    right: 0;
    border: 1px solid var(--border);
    border-radius: 4px;
    cursor: pointer;
    margin-right: 1rem;
    padding: 0.15rem;
    z-index: 1200;
}

.event-menu:hover {
    box-shadow: 0px 2px 0px 0px rgba(0,0,0,0.1);
}
</style>

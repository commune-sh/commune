<script>
import { 
  PUBLIC_BASE_URL,
} from '$env/static/public';

import { page } from '$app/stores';

import { 
    code, 
    link,
} from "$lib/assets/icons";

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    event,
} = $props();


function logEvent() {
    store.ui.updateEventSource(event)
}

function copyLink() {
    const space = $page.params.space
    const room = $page.params.room
    const url = `${PUBLIC_BASE_URL}/${space}/${room}?event=${event.event_id}`
    navigator.clipboard.writeText(url)
}

function click() {
    store.ui.killEventMenu()
}

</script>

<div class="actions text-xs" onclick={click}>
    <div class="action-item grid grid-cols-[auto_1fr] gap-2 items-center"
    onclick={copyLink}>
        <div class="ico h-[18px] w-[18px] ml-1">
            {@html link}
        </div>
        <div class="">
            Copy Link
        </div>
    </div>
    <div class="action-item grid grid-cols-[auto_1fr] gap-2 items-center"
    onclick={logEvent}>
        <div class="ico h-[18px] w-[18px] ml-1">
            {@html code}
        </div>
        <div class="">
            Show Source
        </div>
    </div>
</div>


<style>
.actions {
    position: absolute;
    top: 1.5rem;;
    right: 0;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--view);
    cursor: pointer;
    white-space: nowrap;
    min-width: 130px;
    box-shadow: 0px 2px 0px 0px rgba(0,0,0,0.1);
    padding: 0.1rem;
    z-index: 1300;
}
.action-item {
    padding: 0.3rem 0.1rem;
}
.action-item:hover {
    background: var(--shade-1);
}

.ico {
    fill: var(--text);
    padding: 0.1rem;
}

.ico:hover {
    fill: var(--icon-hover);
}

</style>

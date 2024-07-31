<script>
import { code } from "$lib/assets/icons";
import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    event,
} = $props();


function logEvent() {
    store.ui.updateEventSource(event)
}

function click() {
    store.ui.killEventMenu()
}

</script>

<div class="actions text-xs" onclick={click}>
    <div class="action-item grid grid-cols-[auto_1fr] gap-2 items-center"
    onclick={logEvent}>
        <div class="icon h-[18px] w-[18px] ml-1">
            {@html code}
        </div>
        <div class="">
            Show source
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
}
.action-item {
    padding: 0.2rem 0.1rem;
}
.action-item:hover {
    background: var(--shade-1);
}
</style>

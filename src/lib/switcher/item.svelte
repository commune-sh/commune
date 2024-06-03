<script>
import { draggable } from '@neodrag/svelte';

let { item, activate, active, moving, moved, end } = $props();


const initial = $derived(item.name.charAt(0).toUpperCase())

// is this item being dragged?
let dragging = $state(false);

// item started to be dragged
function dragstart(e) {
    e.dataTransfer.setData('text/plain', item.id)
    activate(item.id);
}

// drag ended
function dragend() {
    dragging = false;
    end()
}

// dropzone state
let dropzone = $derived(moved == item?.id && active != item?.id);

let clientY = $state(0);

// top zone
let top = $derived(clientY < 108);

// is another item being dragged over this one?
function dragover(e) {
    e.preventDefault();
    moving(item.id);
    clientY = e.clientY;
}

function drag(e) {
    dragging = true;
}

// dropped
function drop(e) {
    e.preventDefault();
    console.log(`item ${active} dropped over item ${moved}`)
    clientY = 0;
}

</script>

<div class="grid relative place-items-center mb-[10px]">
    <div class:dragging={dragging} 
        class="item bg-shade-5 w-[46px] h-[46px] rounded-[50%] grid
        hover:rounded-[14px]
        transition-transform duration-200
        place-items-center cursor-pointer hover:bg-shade-7"
        draggable="true"
        ondrag={drag}
        ondragend={dragend}
        ondragleave={dragend}
        ondragover={dragover}
        ondrop={drop}
        ondragstart={dragstart}>
        <div class="initial font-semibold">
        {initial}
        </div>
    </div>

    {#if dropzone && !top}
        <div class="absolute border-2 border-red bottom-[-6px] left-0 right-0
            mx-[6px] rounded-[3px]">
        </div>
    {/if}
    {#if dropzone && top}
        <div class="absolute border-2 border-red top-[-2px] left-0 right-0
            mx-[6px] rounded-[3px]">
        </div>
    {/if}

</div>

<style>
.item {
    transform: translate(0, 0);
}
.dragging {
    opacity: 0.2;
}

.dragging .initial {
    opacity: 0;
}

.dragover {
    border-bottom: 2px solid red;
}
</style>

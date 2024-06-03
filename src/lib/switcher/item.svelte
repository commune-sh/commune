<script>
import { draggable } from '@neodrag/svelte';
import { goto } from '$app/navigation';
import { page } from '$app/stores';

let { space, start, dragged, over, moved, end } = $props();

let active = $derived($page.params?.space === space?.alias)

const initial = $derived(space.name.charAt(0).toUpperCase())

let item;

// is this space being dragged?
let dragging = $state(false);

function drag(e) {
    dragging = true;
}

// dropped
function drop(e) {
    e.preventDefault();
    console.log(`space ${dragged.id} dropped over space ${moved.id}`)
    clientY = 0;
}

// space started to be dragged
function dragstart(e) {
    e.dataTransfer.setData('text/plain', space.id)
    start(space);
}

// drag ended
function dragend() {
    end()
    dragging = false;
}

// is another space being dragged over this one?
function dragover(e) {
    e.preventDefault();
    over(space);
    clientY = e.clientY;
    console.log("is this a prev item?", dragged.id, space.id)
}


// dropzone state
let dropzone = $derived(moved?.id == space?.id && dragged?.id != space?.id);

let clientY = $state(0);

// top zone
let top = $derived(clientY < 108);

let mid = $state(0);

$effect(() => {
    mid = item.getBoundingClientRect().top + item.getBoundingClientRect().height / 2;
})

function goToSpace() {
    goto(`/${space.alias}`)
}

</script>


<div bind:this={item} onclick={goToSpace}
    class="grid relative place-items-center mb-[10px]">
    <div class:dragging={dragging} 
        class="space bg-shade-5 w-[46px] h-[46px] grid
        hover:rounded-[14px]
        transition-transform duration-200
        place-items-center cursor-pointer hover:bg-shade-7"
        class:rounded-[14px]={active}
        class:rounded-[50%]={!active}
        draggable="true"
        ondrag={drag}
        ondragend={dragend}
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
.space {
    transform: translate(0, 0);
}

.dragging {
    opacity: 0.2;
    pointer-events: none;
}

.dragging .initial {
    opacity: 0;
}

.dragover {
    border-bottom: 2px solid red;
}
</style>

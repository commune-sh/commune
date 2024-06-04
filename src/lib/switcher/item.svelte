<script>
import { isInViewport } from '$lib/utils/ui';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { createInitials } from '$lib/utils/string';

let { space, 
    index,
    move,
    start, 
    dragged, 
    over, 
    dragged_over, 
    end, 
    hovered,
    hover
} = $props();

let active = $derived($page.params?.space === space?.alias)

const initial = $derived(createInitials(space?.name))

let item;
let clientY = $state(0);
let mid = $state(0);

// is this space being dragged?
let dragging = $state(false);

function drag(e) {
    dragging = true;
}

// dropped
function drop(e) {
    e.preventDefault();
    //console.log(`space ${dragged} dropped over space ${index}`)

    // previous item
    if(is_prev && at_top) {
        console.log("do nothing")
    } else if(is_prev && at_bottom) {
        move(dragged, index)
    }

    // items before the prev one
    if((dragged < index && !is_prev) && at_top) {
        move(dragged, index - 1)
    } else if((dragged < index && !is_prev) && at_bottom) {
        move(dragged, index)
    }

    // next item
    if(is_next && at_top) {
        move(dragged, index)
    } else if(is_prev && at_bottom) {
        console.log("do nothing")
    }

    // items after the next one
    if((dragged > index && !is_next) && at_top) {
        move(dragged, index)
    } else if((dragged > index && !is_next) && at_bottom) {
        move(dragged, index - 1)
    }


    clientY = 0;
}

// space started to be dragged
function dragstart(e) {
    e.dataTransfer.setData('text/plain', space.id)
    start(index);
}

// drag ended
function dragend() {
    end()
    dragging = false;
}

// is another space being dragged over this one?
function dragover(e) {
    e.preventDefault();
    over(index);
    clientY = e.clientY;
}

let at_top = $derived(clientY <= mid);
let at_bottom = $derived(clientY > mid);

let is_prev = $derived(dragged == index - 1);
let is_next = $derived(dragged == index + 1);


// dropzone state
//let dropzone = $derived(dragged_over?.id == space?.id)
let dropzone = $derived(
    dragged_over == index &&
    dragged != index
)


// top zone
let top = $derived(clientY < 108);


async function moveIntoView() {
    const in_viewport = await isInViewport(item)
    if(!in_viewport) {
        item.scrollIntoView()
    }
}

$effect(() => {
    mid = item.getBoundingClientRect().top + item.getBoundingClientRect().height / 2;

    if(active && item) {
        moveIntoView()
    }
})

function goToSpace() {
    goto(`/${space.alias}`)
}

</script>


<div bind:this={item} onclick={goToSpace}
    class="grid relative place-items-center mb-[10px]">
    <div class:dragging={dragging} 
        onmouseover={hover}
        class:bg-shade-7={active}
        class:active={active || hovered}
        class="space bg-shade-4 w-[46px] h-[46px] grid
        hover:rounded-[14px]
        transition-transform duration-200
        place-items-center cursor-pointer hover:bg-shade-7 opacity-50 hover:opacity-100" 
        class:rounded-[14px]={active}
        class:rounded-[50%]={!active}
        class:text-[14px]={initial.length > 2}
        class:text-[12px]={initial.length > 4}
        class:text-[10px]={initial.length > 5}
        class:text-[9px]={initial.length > 6}
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

    <div class="tick opacity-0 absolute left-[0px] w-[4px] top-[16px] bottom-[16px]
        bg-primary rounded-[4px] duration-100"
        class:opacity-100={active && !dragging}
    >
    </div>

    {#if dropzone}
        <div 
            class:bottom-[-6px]={at_bottom}
            class:top-[-6px]={at_top}
            class="absolute h-[2px] bg-primary left-[3px]
            right-[3px]
            mx-[6px] rounded-[6px]">
        </div>
    {/if}

</div>

<style>
.space {
    transform: translate(0, 0);
}

.space:hover + .tick {
    opacity: 0.5;
} 

.active {
    opacity: 1;
}

.active:hover + .tick {
    opacity: 1;
} 

.dragging {
    opacity: 0.2;
    pointer-events: none;
}

.dragging .initial {
    opacity: 0;
}

.dragging .tick {
    opacity: 0;
}

.dragover {
    border-bottom: 2px solid red;
}

</style>

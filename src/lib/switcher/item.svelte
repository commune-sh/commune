<script>
import { PUBLIC_META_TITLE } from '$env/static/public';

import { onMount } from 'svelte';
import { isInViewport } from '$lib/utils/ui';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { createInitials } from '$lib/utils/string';

import { createStore } from '$lib/store/store.svelte.js'

const store = createStore()

import { 
    room_alias_from_ID, 
    get_local_part,
    thumbnail_from_MXC,
} from '$lib/utils/matrix'

import { getRoomHierarchy } from '$lib/public_server/requests'

import tippy from 'tippy.js';

let tooltip;
let el;
let content;

onMount(() => {
    tooltip = tippy(el, {
        content: content,
        placement: 'right',
        arrow: true,
        duration: 1,
        offset: [0, 26],
        theme: 'inline',
    });
    content.style.display = 'block'
})


let { space, 
    index,
    move,
    start, 
    dragged, 
    over, 
    dragged_over, 
    end, 
    hovered,
    hover,
    update, 
    clientY
} = $props();


const alias = $derived.by(() => {
    if(space?.canonical_alias) {
        return room_alias_from_ID(space.canonical_alias)
    }
})


let active = $derived.by(() => {
    if(alias) {
        return $page.params?.space === alias
    } else if(space?.room_id) {
        return $page.params?.space === space.room_id
    }
})

const initial = $derived(createInitials(space?.name))

let item;
let mid = $state(0);

// is this space being dragged?
let dragging = $state(false);

function drag(e) {
    dragging = true;
    let cy = item.getBoundingClientRect().top + e.offsetY
    update(cy)
}

// dropped
function drop(e) {
    e.preventDefault();

    // previous item
    if(is_prev && at_bottom) {
        move(dragged, index)
    }

    // items before the prev one
    if((dragged <= index - 2) && at_top) {
        move(dragged, index - 1)
    } else if((dragged <= index - 2) && at_bottom) {
        move(dragged, index)
    }

    // next item
    if(is_next && at_top) {
        move(dragged, index)
    }

    // items after the next one
    if((dragged > index && !is_next) && at_top) {
        move(dragged, index)
    } else if((dragged > index && !is_next) && at_bottom) {
        move(dragged, index)
    }

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
}

let at_top = $derived(clientY <= mid);
let at_bottom = $derived(clientY > mid);

let is_prev = $derived(dragged == index - 1);
let is_next = $derived(dragged == index + 1);


// dropzone state
//let dropzone = $derived(dragged_over?.id == space?.id)
let dropzone = $derived(
    dragged_over == index
)



async function moveIntoView() {
    const in_viewport = await isInViewport(item)
    if(!in_viewport) {
        item.scrollIntoView()
    }
}

let mounted = $state(false);

$effect(() => {

    if(dragged == null) {
        mid = item.getBoundingClientRect().top + item.getBoundingClientRect().height / 2;
    }

    if(active && item) {
        moveIntoView()
    }

    if(item) {
        mounted = true;
    }
})

$effect(() => {
    if(active) {
        store.app.updateSpace(space.alias)
        //getHierarchy()
    }
})


function goToSpace() {
    tooltip.hide()

    let title = `${space.name} - ${PUBLIC_META_TITLE}`
    document.title = title

    let location = alias ? alias : space.room_id

    goto(`/${location}`)
}

async function getHierarchy() {
    const response = await getRoomHierarchy(space.room_id)
    console.log(response)
}


let avatar = $derived.by(() => {
    if(space?.avatar_url) {
        return thumbnail_from_MXC(space.avatar_url, 46, 46)
    }
})

function logItem(e) {
    e.preventDefault()
    console.log(space)
}

let size = $state(46)

</script>

<div class="hidden" bind:this={content}>
    <div class="font-bold">
        {space.name}
    </div>
</div>



<div bind:this={item} onclick={goToSpace}
    oncontextmenu={logItem}
    ondrop={drop}
    ondragover={dragover}
    class="grid relative place-items-center mb-[10px]">

    <div bind:this={el} class:dragging={dragging} 
        onmouseover={hover}
        class:bg-shade-7={active}
        class:active={active || hovered}
        class="space bg-shade-4 w-[{size}px] h-[{size}px] grid
        hover:rounded-[14px]
        transition-transform duration-200
        place-items-center cursor-pointer hover:bg-shade-7 opacity-50 hover:opacity-100" 
        class:rounded-[14px]={active}
        class:rounded-[50%]={!active}
        class:text-[14px]={initial.length > 2}
        class:text-[12px]={initial.length > 4}
        class:text-[10px]={initial.length > 5}
        class:text-[9px]={initial.length > 6}
        class:bg-img={avatar}
        draggable="true"
        ondrag={drag}
        ondragend={dragend}
        ondragstart={dragstart}
        style="background-image: url({avatar})">

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

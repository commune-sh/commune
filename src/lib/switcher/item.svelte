<script>
import { isInViewport } from '$lib/utils/ui';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { createInitials } from '$lib/utils/string';

import { tooltip } from '$lib/tooltip/tooltip'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

import { 
    room_alias_from_ID, 
    thumbnailURL,
    is_local_room,
    processHash
} from '$lib/utils/matrix'

let { space, 
    index,
    move,
    start, 
    dragged, 
    over, 
    dragged_over, 
    end, 
    update, 
    clientY
} = $props();


const alias = $derived.by(() => {
    if(space?.canonical_alias) {
        return room_alias_from_ID(space.canonical_alias)
    }
})

const is_local = $derived.by(() => {
    return is_local_room(space?.canonical_alias)
})

const hash_params = $derived.by(() => {
    return processHash($page.url.hash)
})

const space_param = $derived.by(() => {
    if($page?.params?.space) {
        return $page.params.space
    }
    if($page?.url?.hash) {
        return hash_params?.space
    }
})


let active = $derived.by(() => {
    if(!is_local) {
        return space_param === space.canonical_alias
    }
    if(alias) {
        return space_param === alias
    } else if(space?.room_id) {
        return space_param === space.room_id
    }
})

const name = $derived(space?.name ? space.name : alias)

const initial = $derived(createInitials(name))

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

const authReady = $derived(store.auth.ready)
const authenticated = $derived(store.auth.authenticated)

const space_state = $derived.by(() => {
    return store.matrix.room_state[store.matrix.active_space?.room_id]
})

$effect(() => {
    // if no room is active, navigate to one
    /*
    if(active && space_state && !$page.params.room) {
        const space_rooms = $derived(store.matrix.space_rooms)
        if(space_rooms[0]?.commune_alias) {
            goto(`/${$page.params.space}/${space_rooms[0].commune_alias}`)
        }
    }
    */


    if(active && space && authReady && !authenticated) {
    }

    /*
    if(active && name) {
        document.title = name
    }
    */

})

function fetchState() {
    store.matrix.fetchRoomState(space.room_id)
}


function goToSpace() {

    /*
    if(name) {
        document.title = name
    }
    */

    if(!is_local) {
        goto(`/${space.canonical_alias}`)
        return
    }

    let location = alias ? alias : space.room_id

    const route = store.ui.getRoute(location)

    if($page.url.pathname == route) {
        goto(`/${location}`)
        return
    }

    if(route) {
        goto(route)
        return
    }

    goto(`/${location}`)
}


let avatar = $derived.by(() => {
    if(space?.avatar_url) {
        return thumbnailURL(space.avatar_url, 46, 46, 'crop')
    }
})

function logItem(e) {
    e.preventDefault()
    console.log(space)
}

let size = $state(46)

const options = $derived.by(() => {
    return {
        content: name,
        placement: 'right',
        offset: [0, 16]
    }
})

</script>


<div bind:this={item} onclick={goToSpace}
    use:tooltip={options}
    onmousedown={fetchState}
    oncontextmenu={logItem}
    ondrop={drop}
    ondragover={dragover}
    class="grid relative place-items-center mb-[10px]">

    <div class:dragging={dragging} 
        class:bg-shade-7={active}
        class:active={active}
        class="space bg-shade-4 w-[{size}px] h-[{size}px] grid
        transition-transform duration-200
        place-items-center cursor-pointer hover:bg-shade-7 rounded-[50%]" 
        class:text-[14px]={initial?.length > 2}
        class:text-[12px]={initial?.length > 4}
        class:text-[10px]={initial?.length > 5}
        class:text-[9px]={initial?.length > 6}
        draggable="true"
        ondrag={drag}
        ondragend={dragend}
        ondragstart={dragstart}>

        {#if avatar}
            <img src={avatar} alt={name} class="avatar" loading="lazy" />
        {/if}
        {#if !avatar}
        <div class="initial font-semibold">
            {initial} 
        </div>
        {/if}
    </div>

    <div class="pill opacity-0 absolute left-[0px] w-[4px] top-[16px] bottom-[16px]
        bg-pill duration-100"
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

.space:hover + .pill {
    opacity: 0.8;
} 

.active {
    opacity: 1;
}

.active:hover + .pill {
    opacity: 1;
} 

.pill {
    border-radius: 0 4px 4px 0;
}

.dragging {
    opacity: 0.2;
    pointer-events: none;
}

.dragging .initial {
    opacity: 0;
}

.initial {
    text-transform: uppercase;
}

.dragging .pill {
    opacity: 0;
}

.dragover {
    border-bottom: 2px solid red;
}

</style>

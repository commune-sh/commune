<script lang="ts">
import { isInViewport } from '../utils/ui';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { createInitials } from '../utils/string';

import { tooltip } from '../tooltip/tooltip'

import type { Data } from '../types/common'


import { createStore } from '../store/store.svelte'
const store = createStore()

import { 
    room_alias_from_ID, 
    is_local_room,
    strip_hash,
} from '../utils/matrix'

import { 
    getImageThumbnail,
} from '../appservice/requests.svelte'


let { 
    data,
    space, 
    index,
    move,
    start, 
    dragged, 
    over, 
    dragged_over, 
    end, 
    update, 
    clientY
}: {
    data: Data,
    space: any,
    index: number,
    move: (from: number, to: number) => void,
    start: (index: number) => void,
    dragged: number | null,
    over: (index: number) => void,
    dragged_over: number | null,
    end: () => void,
    update: (cy: number) => void,
    clientY: number
} = $props();


const is_local = $derived.by(() => {
    return is_local_room(space?.canonical_alias, data.ENV.HOMESERVER_NAME)
})

let stripped = $derived.by(() => {
    return strip_hash(space.canonical_alias)
})

const alias = $derived.by(() => {
    if(!is_local) {
        return stripped
    }
    if(space?.canonical_alias) {
        return room_alias_from_ID(space.canonical_alias)
    }
})


let active = $derived.by(() => {
    if(!is_local) {
        return page.params.space === stripped
    }
    if(page.params.space == space.room_id) {
        return true
    }
    if(alias) {
        return page.params.space === alias
    } else if(space?.room_id) {
        return page.params.space === space.room_id
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

const authenticated = $derived(store.session.authenticated)

const space_state = $derived.by(() => {
    return store.matrix.room_state[store.matrix.active_space?.room_id]
})

$effect(() => {
    // if no room is active, navigate to one
    /*
    if(active && space_state && !page.params.room) {
        const space_rooms = $derived(store.matrix.space_rooms)
        if(space_rooms[0]?.commune_alias) {
            goto(`/${page.params.space}/${space_rooms[0].commune_alias}`)
        }
    }
    */



    /*
    if(active && name) {
        document.title = name
    }
    */

})

function fetchState() {
    store.matrix.fetchRoomState(space.room_id, data.ENV.APPSERVICE_URL)
}

function goToSpace() {

    let location = alias ? alias : space.room_id

    const route = store.ui.getRoute(location)

    if(page.url.pathname == route) {
        goto(`/${location}`)
        return
    }

    if(route) {
        goto(route)
        return
    }

    if(!is_local) {
        goto(`/${stripped}`)
        return
    }

    goto(`/${location}`)
}

function handleEnter(e: KeyboardEvent) {
    if(e.key === 'Enter') {
        goToSpace()
    }
}


let avatar: string | undefined = $state(undefined)

let avatar_url = $derived.by(() => {
    return space?.avatar_url
})

async function getAvatar() {
    let content_uri = await getImageThumbnail(data.ENV.APPSERVICE_URL, {
        mxcid: avatar_url,
        width: 96,
        height: 96,
        method: 'crop'
    })
    if(content_uri) {
        avatar = content_uri
    }
}

$effect(() => {
    if(!avatar && avatar_url) {
        getAvatar()
    }
})

function logItem(e) {
    e.preventDefault()
    console.log(space)
}

const options = $derived.by(() => {
    return {
        content: name,
        placement: 'right',
        offset: [0, 16]
    }
})

const fontSize = $derived.by(() => {
    if(initial?.length > 4) {
        return '9px'
    } else if(initial?.length >= 3 && initial?.length <= 4) {
        return '11px'
    } else if(initial?.length > 2 && initial?.length <= 4) {
        return '13px'
    }
    return `1rem`
})

</script>

<div bind:this={item} 
    role="button"
    tabindex="0"
    onmousedown={fetchState}
    oncontextmenu={logItem}
    ondrop={drop}
    ondragover={dragover}
    class="grid relative place-items-center mb-[10px]">

    <div class:dragging={dragging} 
        role="button"
        tabindex="0"
        onclick={goToSpace}
        onkeypress={handleEnter}
        use:tooltip={options}
        class:bg-cmn-7={active && !avatar}
        class:active={active}
        class:bg-cmn-4={!avatar}
        class:hover:bg-cmn-7={!avatar}
        class="space w-[40px] h-[40px] grid
        transition-transform duration-200
        place-items-center cursor-pointer rounded-[14px]" 
        style="font-size: {fontSize}"
        draggable="true"
        ondrag={drag}
        ondragend={dragend}
        ondragstart={dragstart}>

        {#if avatar}
            <img src={avatar} alt={name} class="" loading="lazy" />
        {/if}
        {#if !avatar_url}
        <div class="initial font-medium">
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

img {
    border-radius: 14px;
}
</style>

<script>
import { tick, onMount, onDestroy, createEventDispatcher } from 'svelte'
import { em1 } from '$lib/assets/icons.js'
import { store } from '$lib/store/store.js'
import { v4 as uuidv4 } from 'uuid';
import tippy from 'tippy.js';

const dispatch = createEventDispatcher()

let id = uuidv4()

export let busy;
export let reply;
export let position = 'right';
export let center = true;

export let isChat = false;

export let room_alias = null;

let reactEl;
function insertEmoji() {
    if(busy) {
        return
    }
    let ra = room_alias
    if(ra?.includes('/')) {
        ra = ra?.split('/')[0]
    }
    let e = {
        reacting_to: id,
        position: position || 'right',
        target: reactEl,
        space_alias: ra,
        isChat: isChat,
    }

    store.activateEmojiPicker(e)
}

$: selectedEmoji = $store.emojiPicker.selected

$: emojiSelected = $store.emojiPicker.reacting_to == id &&
    selectedEmoji != null &&
    selectedEmoji != undefined


$: if(emojiSelected) {
    store.killEmojiPicker()
    dispatch('selected', selectedEmoji)
}

onMount(() => {
    tippy('.insert-emoji', {
        content: 'Insert emoji',
        arrow: true,
        duration: 1,
        theme: 'inline',
    });
})

$: active = $store.emojiPicker.active &&
    $store.emojiPicker.isChat &&
    !$store.emojiPicker.isGIF

</script>

<div class="insert-emoji ml2 c-ico"
    class:active={active}
    class:grd-c={center}
    class:ptop={!center}
    on:click={insertEmoji}
    bind:this={reactEl}>
    {@html em1}
</div>

<style>
.insert-emoji {
}

.c-ico {
    height: 20px;
    width: 20px;
    filter: grayscale(1);
}

.active {
    filter: none;
    opacity: 1;
}

.ptop {
    margin-top: 10px;
    padding: 0.5rem;
}
</style>

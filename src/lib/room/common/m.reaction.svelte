<script>
import { 
    thumbnailURL,
} from '$lib/utils/matrix'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    key,
    events,
} = $props();

const is_custom = $derived.by(() => {
    return key.startsWith('mxc://')
})

const reaction = $derived.by(() => {
    return is_custom ? thumbnailURL(key, 32, 32, 'crop') : key
})

</script>

<div class="reaction grid grid-cols-[auto_auto] px-1 place-items-center
    cursor-pointer bg-shade-3 text-light mr-1 rounded-[4px]">
    <div class="emoji">
        {#if is_custom}
            <img src={reaction} width="16" height="16" alt={key} />
        {:else}
            {key}
        {/if}
    </div>
    <div class="text-xs ml-1">
        {events?.length}
    </div>
</div>

<style>
:global(.reaction .emoji) {
    font-family: 'Twemoji', 'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif;
}
</style>

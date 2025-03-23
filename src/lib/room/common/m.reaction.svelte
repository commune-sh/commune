<script lang="ts">
import { 
    thumbnailURL,
} from '$lib/utils/matrix'

import { 
    getAvatarThumbnail,
} from '$lib/appservice/requests.svelte'

import { createStore } from '$lib/store/store.svelte'
const store = createStore()

interface Props {
    key: string,
    events: any,
}

let {
    key,
    events,
}: Props = $props();

const is_custom = $derived.by(() => {
    return key.startsWith('mxc://')
})

const reaction = $derived.by(() => {
    return is_custom ? thumbnailURL(key, 32, 32, 'crop') : key
})

let reaction_url: string | null = $state(null);
async function getReaction() {
    if(!is_custom) return
    let content_uri = await getAvatarThumbnail(key)
    if(content_uri) {
        reaction_url = content_uri
    }
}

$effect(() => {
    if(store.app.appservice && is_custom) {
        getReaction()
    }
})

</script>

<div class="reaction grid grid-cols-[auto_auto] px-1 place-items-center
    cursor-pointer bg-shade-3 text-light mr-1 rounded-[4px]">
    <div class="emoji">
        {#if is_custom && reaction_url}
            <img src={reaction_url} width="16" height="16" alt={key} />
        {:else if !is_custom}
            {key}
        {/if}
    </div>
    <div class="count text-2xs ml-1 font-semibold">
        {events?.length}
    </div>
</div>

<style>
:global(.reaction .emoji) {
    font-family: 'Twemoji', 'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif;
}

@media (max-width: 768px) {
    .count {
        font-size: 0.625rem;
    }
}

</style>

<script lang="ts">
import type { Data } from '../../types/common'

import { 
    thumbnailURL,
} from '../../utils/matrix'

import { 
    getAvatarThumbnail,
} from '../../appservice/requests.svelte'

import { createStore } from '../../store/store.svelte'
const store = createStore()

let {
    data,
    key,
    events,
}: {
    data: Data,
    key: string,
    events: any,
} = $props();

const is_custom = $derived.by(() => {
    return key.startsWith('mxc://')
})

const reaction = $derived.by(() => {
    return is_custom ? thumbnailURL(key, 32, 32, 'crop') : key
})

let reaction_url: string | null = $state(null);
async function getReaction() {
    if(!is_custom) return
    let content_uri = await getAvatarThumbnail(data.ENV.APPSERVICE_URL, key)
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
    cursor-pointer bg-cmn-3 text-light mr-1 rounded-[4px]">
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

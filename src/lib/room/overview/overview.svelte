<script>
import { marked } from 'marked'

import { 
    get_local_part,
    processURL,
} from '$lib/utils/matrix'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const active_space = $derived(store.matrix.active_space)

const space_state = $derived.by(() => {
    return store.matrix.room_state[active_space?.room_id]
})

const overview = $derived.by(() => {
    return space_state?.find(r => r.type == 'commune.room.overview')?.content
})

const member_count = $derived.by(() => {
    return space_state?.filter(r => r.type == 'm.room.member')?.length
})

const ready = $derived(space_state != undefined)

const avatar = $derived.by(() => {
    const url = space_state?.find(r => r.type == 'm.room.avatar')?.content?.url
    if(url) {
        return processURL(url)
    }
    return null
})

const name = $derived.by(() => {
    if(active_space?.name) {
        return active_space.name
    }
    if(active_space?.canonical_alias) {
        return get_local_part(active_space.canonical_alias)
    }
})

const alias = $derived.by(() => {
    return active_space?.canonical_alias
})

const topic = $derived.by(() => {
    return active_space?.topic
})

const render_topic = $derived.by(() => {
    if(topic) {
        return marked.parse(topic)
    }
})

</script>

{#if ready}
<div class="flex h-full justify-center items-center">
    <div class="overview flex flex-col p-2 text-center">
        <div class="mb-4">
            {#if avatar}
                <img src={avatar} class="w-20 h-20 rounded-full mx-auto" />
            {/if}
        </div>
        <div class="font-semibold text-xl">
            {name}
        </div>
        <div class="mt-2 text-sm text-light">
            {member_count} members
        </div>
        <div class="topic mt-4 ">
            {#if render_topic}
                {@html render_topic}
            {/if}
        </div>
    </div>
</div>
{/if}


<style>
.overview {
    max-width: 400px;
    line-height: 1.375;
    margin-top: -5rem;
}

:global(.topic a) {
    color: var(--link);
    cursor: pointer;
}
</style>

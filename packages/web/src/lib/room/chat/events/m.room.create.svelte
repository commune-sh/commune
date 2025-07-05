<script lang="ts">

import type { Data } from '$lib/types/common'

import { createStore } from '$lib/store/store.svelte'
const store = createStore()

let {
    data,
    event,
    event_user,
}: {
    data: Data,
    event: any,
    event_user: any,
} = $props();


const sender = $derived(event?.sender)

const topic = $derived.by(() => {
    return event?.content?.topic
})

const has_prev = $derived.by(() => {
    return event?.prev_content?.topic
})

const action = $derived.by(() => {
    return has_prev ? `changed`: `set`
})

</script>

<div class="content-center text-xs">
    {@render event_user()}
    <span class="">
        <span class="text-light">created the room</span>
    </span>
</div>

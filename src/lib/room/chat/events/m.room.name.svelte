<script lang="ts">
import type { Data } from '../../../types/common'

import { createStore } from '../../../store/store.svelte'
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

const name = $derived.by(() => {
    return event?.content?.name
})

const has_prev = $derived.by(() => {
    return event?.prev_content?.name
})

const action = $derived.by(() => {
    return has_prev ? `changed`: `set`
})

</script>

<div class="content-center text-xs">
    {@render event_user()}
    <span class="">
        <span class="text-light">{action} the room name to </span>
        <span class="">{name}</span>
    </span>
</div>

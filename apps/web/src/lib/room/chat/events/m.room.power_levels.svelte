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

</script>

<div class="content-center text-xs">
    {@render event_user()}
    <span class="">
        <span class="text-light">updated the room's permissions.</span>
    </span>
</div>

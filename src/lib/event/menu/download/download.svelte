<script>
import { download } from "$lib/assets/icons";

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    event,
} = $props();

function toggle() {
}

</script>

<div class="download"
    onclick={toggle}>
    <div class="icon h-[20px] w-[20px]">
        {@html download}
    </div>
</div>

<style>
.active {
    background: var(--shade-1);
}
</style>

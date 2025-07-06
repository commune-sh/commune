<script lang="ts">

import type { Data } from '$lib/types/common'

let {
    data,
}: {
    data: Data,
} = $props();

import { createStore } from '$lib/store/store.svelte'
const store = createStore()

let auth_active = $derived(store.ui.auth_active)

function toggle() {
    store.ui.openAuth()
}

</script>

<div class="">
</div>


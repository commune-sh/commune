<script lang="ts">

import type { Data } from '../../types/common'

let {
    data,
}: {
    data: Data,
} = $props();

import { createStore } from '../../store/store.svelte'
const store = createStore()

let auth_active = $derived(store.ui.auth_active)

function toggle() {
    store.ui.openAuth()
}

</script>

<div class="">
</div>


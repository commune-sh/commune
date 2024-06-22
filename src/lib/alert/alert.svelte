<script>

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()


const alert = $derived(store.ui.alert)

const active = $derived(alert.active)

</script>

{#if active}
<div class="alert p-4 bg-orange font-semibold">
    {alert?.message}
</div>
{/if}

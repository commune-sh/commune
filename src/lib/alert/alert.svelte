<script>

import { createStore } from '../store/store.svelte'
const store = createStore()


const alert = $derived(store.ui.alert)

const active = $derived(alert.active)

</script>

{#if active}
<div class="alert p-4 bg-orange font-semibold">
    {alert?.message}
</div>
{/if}

<style>
</style>

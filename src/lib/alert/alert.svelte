<script>
// UI store
import { createUIStore } from '$lib/store/ui.svelte.js'
const ui_store = createUIStore()


const alert = $derived(ui_store.alert)

const active = $derived(alert.active)

</script>

{#if active}
<div class="alert p-4 bg-orange font-semibold">
    {alert?.message}
</div>
{/if}

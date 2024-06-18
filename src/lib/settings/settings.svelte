<script>
import { createUIStore } from '$lib/store/ui.svelte.js'

const ui_store = createUIStore()
let settings_active = $derived(ui_store.settings_active)

function kill(e) {
    if(e.target == e.currentTarget) {
        ui_store.closeSettings()
    }
}
</script>

{#if settings_active}
<div class="fixed inset-x-0 inset-y-0 bg-mask grid h-screen place-items-center" 
    onclick={kill}>
        <div class="bg-shade-4 p-4">
            settings
        </div>
</div>
{/if}

<script>
import { login } from '$lib/matrix/requests'
import { createUIStore } from '$lib/store/ui.svelte.js'

const ui_store = createUIStore()
let auth_active = $derived(ui_store.auth_active)

function kill(e) {
    if(e.target == e.currentTarget) {
        ui_store.closeAuth()
    }
}

</script>

{#if auth_active}
<div class="fixed inset-x-0 inset-y-0 bg-mask grid h-full place-items-center" 
    onclick={kill}>
        <div class="">
        </div>
</div>
{/if}

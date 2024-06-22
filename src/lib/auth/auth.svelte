<script>
import { login } from '$lib/matrix/requests'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let auth_active = $derived(store.ui.auth_active)

function kill(e) {
    if(e.target == e.currentTarget) {
        store.ui.closeAuth()
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

<script>
import { login } from '$lib/matrix/requests'
import { createStore } from '$lib/store/store.svelte.js'

const store = createStore()
let auth_toggled = $derived(store.auth_toggled)

function kill(e) {
    if(e.target == e.currentTarget) {
        store.toggleAuth()
    }
}

</script>

{#if auth_toggled}
<div class="fixed inset-x-0 inset-y-0 bg-mask grid h-screen place-items-center" 
    onclick={kill}>
        <div class="">
            ok
        </div>
</div>
{/if}

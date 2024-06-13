<script lang="ts">
import { createStore } from '$lib/store/store.svelte.js'

const store = createStore()

let auth_toggled = $derived(store.auth_toggled)

function toggle() {
    store.toggleAuth()
}

</script>

<div class="bg-sidebar">
    {auth_toggled}
    <button onclick={toggle}>Toggle</button>
</div>


<script lang="ts">
import { createUIStore } from '$lib/store/ui.svelte.js'

const ui_store = createUIStore()

let auth_active = $derived(ui_store.auth_active)

function toggle() {
    ui_store.openAuth()
}

</script>

<div class="bg-sidebar">
    {auth_active}
    <button onclick={toggle}>Toggle</button>
</div>


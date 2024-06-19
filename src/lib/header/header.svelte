<script>
import { page } from '$app/stores';
import { bars } from '$lib/assets/icons'

// auth store
import { createAuthStore } from '$lib/store/auth.svelte.js'
const authStore = createAuthStore()
const show_auth = $derived(authStore.ready && authStore.authenticated)

// UI store
import { createUIStore } from '$lib/store/ui.svelte.js'
const ui_store = createUIStore()

const menu_active = $derived(ui_store.menu_active)

function toggleMenu() {
    ui_store.toggleMenu()
}

</script>

<div class="header grid 
    bg-header border-solid border-b border-shade-6">
    <div class="menu grid cursor-pointer place-items-center" 
        onclick={toggleMenu}>
        <div class="icon h-[32px] w-[32px]">
            {@html bars}
        </div>
    </div>
    <div class="grid grid-cols-[auto_1fr_auto] mx-8 items-center justify-items-start">
        <div class="">
        </div>
        <div class="">
        </div>
        <div class="">
        </div>
    </div>
</div>

<style>
.menu {
    display: none;
}
@media (max-width: 768px) {
    .header {
        grid-template-columns: 52px 1fr;
    }
    .menu {
        display: grid;
    }
}
</style>

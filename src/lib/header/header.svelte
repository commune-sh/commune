<script>
import { page } from '$app/stores';
import { bars } from '$lib/assets/icons'

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
    <div class="grid items-center justify-items-start">
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

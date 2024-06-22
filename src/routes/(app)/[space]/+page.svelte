<script>
import { page } from '$app/stores';

import Sidebar from '$lib/sidebar/sidebar.svelte'
import Header from '$lib/header/header.svelte'

// app store
import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const menu_active = $derived(store.ui.menu_active)

let container;

</script>


<div class="grid grid-cols-[232px_1fr]" class:con={!menu_active}
    bind:this={container}
class:menu-active={menu_active}>

    <div class="sidebar grid" class:show={menu_active}>
        <Sidebar />
    </div>

    <div class="view grid grid-rows-[52px_1fr] bg-view h-full">
        <Header />
        <section class="view select-text">
            {$page.params.space}
        </section>
    </div>

</div>


<style>
.menu-active {
    grid-template-columns: 232px 1fr;
}
@media (max-width: 768px) {
    .con {
        grid-template-columns: auto;
    }
    .sidebar {
        display: none;
    }
    .show {
        display: grid;
    }
}
</style>

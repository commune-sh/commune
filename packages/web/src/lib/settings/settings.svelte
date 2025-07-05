<script>
import { onMount, onDestroy } from 'svelte'
import { browser } from '$app/environment'
import { close } from '$lib/assets/icons'

import { createStore } from '$lib/store/store.svelte'
const store = createStore()

const unsaved_changes = $derived(store.settings.unsaved_changes)

onMount(() => {
})

$effect(() => {
    if(browser && settings_active) {
        document.body.addEventListener('keydown', esc)
    } else if(browser && !settings_active) {
        document.body.removeEventListener('keydown', esc)
    }
})

let settings_active = $derived(store.ui.settings_active)

function esc(e) {
    if(e.key === 'Escape') {
        store.ui.closeSettings()
    }
}

function kill(e) {
    store.ui.closeSettings()
}
</script>

{#if settings_active}
<div class="settings fixed inset-x-0 inset-y-0 bg-background grid h-full
        place-items-center" >
    <div class="">
        settings
    </div>
    <div class="fixed icon cursor-pointer" onclick={kill}>
        {@html close}
    </div>
</div>
{/if}


<style>
.settings {
    z-index: 10000;
}
.icon {
    height: 48px;
    width: 48px;
    top: 2rem;
    right: 2rem;
    fill: var(--icon);
}
.icon:hover {
    fill: var(--icon-hover);
}
</style>


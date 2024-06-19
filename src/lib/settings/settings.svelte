<script>
import { createUIStore } from '$lib/store/ui.svelte.js'
import { onMount, onDestroy } from 'svelte'
import { browser } from '$app/environment'
import { close } from '$lib/assets/icons'

// settings store
import { createSettingsStore } from '$lib/store/settings.svelte.js'
const settingsStore = createSettingsStore()

const unsaved_changes = $derived(settingsStore.unsaved_changes)

onMount(() => {
})

$effect(() => {
    if(browser && settings_active) {
        document.body.addEventListener('keydown', esc)
    } else if(browser && !settings_active) {
        document.body.removeEventListener('keydown', esc)
    }
})

const ui_store = createUIStore()
let settings_active = $derived(ui_store.settings_active)

function esc(e) {
    if(e.key === 'Escape') {
        ui_store.closeSettings()
    }
}

function kill(e) {
    ui_store.closeSettings()
}
</script>

{#if settings_active}
<div class="fixed inset-x-0 inset-y-0 bg-mask grid h-full
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


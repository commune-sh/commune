<script>
import Settings from '$lib/settings/settings.svelte'
import { settings as settingsIcon } from '$lib/assets/icons'
import { createUIStore } from '$lib/store/ui.svelte.js'

const ui_store = createUIStore()

function openSettings() {
    ui_store.openSettings()
}

let settings_active = $derived(ui_store.settings_active)

</script>

<div class="grid relative place-items-center my-[20px]" >
    <div class="icon cursor-pointer" onclick={openSettings}>
        {@html settingsIcon}
    </div>
</div>

<Settings />

<style>
.icon {
    height: 32px;
    width: 32px;
    fill: var(--icon);
}
.icon:hover {
    fill: var(--icon-hover);
}

</style>


<script>
import { settings as settingsIcon } from '$lib/assets/icons'
import { createUIStore } from '$lib/store/ui.svelte.js'
import { onMount } from 'svelte';

const ui_store = createUIStore()

function openSettings() {
    if(menu_active) {
        ui_store.killMenu()
    }
    ui_store.openSettings()
    if(tooltip) {
        tooltip.hide()
    }
}

let settings_active = $derived(ui_store.settings_active)
let menu_active = $derived(ui_store.menu_active)

import tippy from 'tippy.js';

let tooltip;
let el;
let content;

onMount(() => {
    tooltip = tippy(el, {
        content: content,
        placement: 'right',
        arrow: true,
        duration: 1,
        offset: [0, 26],
        theme: 'inline',
    });
    content.style.display = 'block'
})
</script>

<div class="hidden" bind:this={content}>
    <div class="font-bold">
        Settings
    </div>
</div>

<div class="grid relative place-items-center my-[20px]" >
    <div bind:this={el} class="icon cursor-pointer" onclick={openSettings}>
        {@html settingsIcon}
    </div>
</div>


<style>
.icon {
    height: 28px;
    width: 28px;
    fill: var(--icon);
}
.icon:hover {
    fill: var(--icon-hover);
}

</style>


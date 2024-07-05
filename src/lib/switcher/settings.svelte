<script>
import { settings as settingsIcon } from '$lib/assets/icons'

import { onMount } from 'svelte';

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()


function openSettings() {
    if(menu_active) {
        store.ui.killMenu()
    }
    store.ui.openSettings()
    if(tooltip) {
        tooltip.hide()
    }
}

let settings_active = $derived(store.ui.settings_active)
let menu_active = $derived(store.ui.menu_active)

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
        offset: [0, 36],
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


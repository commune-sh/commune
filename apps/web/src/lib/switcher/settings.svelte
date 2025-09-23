<script>
import { settings as settingsIcon } from '../assets/icons'

import { tooltip } from '../tooltip/tooltip'

import { createStore } from '../store/store.svelte'
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

let options = {
    content: 'Settings',
    placement: 'right',
    offset: [0, 36]
}

</script>


<div class="grid relative place-items-center my-[20px]" >
    <div class="icon cursor-pointer" 
        use:tooltip={options}
        onclick={openSettings}>
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


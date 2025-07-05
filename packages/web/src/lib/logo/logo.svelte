<script>
import { logo } from '$lib/assets/logo';
import { goto } from '$app/navigation';
import { page } from '$app/state';

import { tooltip } from '$lib/tooltip/tooltip'

let { is_static, loading } = $props();

let active = $derived(page.url.pathname == '/')

import { createStore } from '$lib/store/store.svelte'
const store = createStore()

const menu_active = $derived(store.ui.menu_active)

function goHome() {
    if(is_static) {
        return
    }
    if(menu_active) {
        store.ui.toggleMenu()
    }
    goto(`/`)
}

let options = {
    content: 'Home',
    placement: 'right',
    offset: [0, 26]
}

</script>

<div class="container grid place-items-center">
    <div onclick={goHome}
        class:active={(active && !loading) || is_static}
        class:loading={loading}
        class:animate-pulse={loading}
        class:cursor-pointer={!is_static}
        class="logo relative bg-cmn-7 justify-center w-[40px] h-[40px] p-[4px]
        rounded-[14px] hover:bg-cmn-7">
        {@html logo}
    </div>
</div>


<style>

.logo {
    fill: var(--logo-fill-inactive);
}

.logo:hover {
    background-color: var(--logo-background);
    fill: var(--logo-fill);
}

.active {
    background-color: var(--logo-background);
    fill: var(--logo-fill);
    border-radius: 14px;
}

.loading {
    height: 38px;
    width: 38px;
    padding: 8px;
    border-radius: 12px;
    cursor: default;
    background: var(--cmn-1);
}

</style>

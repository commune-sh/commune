<script>
import { 
    PUBLIC_META_IMAGE,
} from '$env/static/public';

import { page } from '$app/stores';

import View from '$lib/view/view.svelte'
import Alert from '$lib/alert/alert.svelte'
import Switcher from '$lib/switcher/switcher.svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()
const alert_active = $derived(store.ui.alert?.active)

let {
    data,
    content,
} = $props();

let is_home = $derived($page.route.id == '/(app)')
let is_space = $derived($page.params.space != undefined)
let is_room = $derived($page.params.room != undefined)

let is_rooms = $derived($page.route.id == '/(app)/rooms')

let show_view = $derived(is_space || is_room || is_rooms)

let root;

$effect(() => {
})

const menu_active = $derived(store.ui.menu_active)
</script>

<main class="app grid h-dvh" class:grid-rows-[auto_1fr]={alert_active}>

{#if alert_active}
    <Alert />
{/if}


<div class="root grid grid-cols-[auto_1fr] h-full select-none" 
    class:menu-active={menu_active}
    bind:this={root}>
    <div class="switcher bg-switcher grid">
        <Switcher />
    </div>

    <div class="content-container grid h-full relative">

        {#if show_view}
            <View {content} />
        {:else}
            {@render content()}
        {/if}

    </div>

</div>

</main>

<style>

@media (max-width: 768px) {
    .root {
        grid-template-columns: 1fr;
    }
    .switcher {
        display: none;
    }
}

.menu-active {
    grid-template-columns: auto 1fr;
}

.menu-active .switcher {
    display: grid;
}
</style>

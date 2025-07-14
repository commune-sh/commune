<script lang="ts">
import { browser } from '$app/environment'

import { page } from '$app/state';

import View from '../view/view.svelte'
import Alert from '../alert/alert.svelte'
import Switcher from '../switcher/switcher.svelte'

import { createStore } from '../store/store.svelte'
const store = createStore()
const alert_active = $derived(store.ui.alert?.active)

import type { Data } from '../types/common'
import type { Snippet } from 'svelte';

let {
    data,
    content,
}: {
    data: Data,
    content: Snippet
} = $props();

let is_home = $derived(page.route.id == '/(app)')

const no_hash = $derived.by(() => {
    if(browser) {
        return location.hash == ""
    }
})

let is_space = $derived(page.params.space != undefined)
let is_space_child_room = $derived(page.params.room != undefined)

let non_space_room = $derived(page.route.id?.includes('/(app)/rooms'))

let show_view = $derived(is_space || is_space_child_room || non_space_room)

let root;

$effect(() => {
    //console.log(page)
})

const menu_active = $derived(store.ui.menu_active)
</script>

<main class="app grid h-dvh" class:grid-rows-[auto_1fr]={alert_active}>

{#if alert_active}
    <Alert />
{/if}


<div class="root grid grid-cols-[auto_1fr] h-full text-md select-none" 
    class:menu-active={menu_active}
    bind:this={root}>
    <div class="switcher bg-switcher grid">
        <Switcher {data} />
    </div>

    <div class="content-container grid h-full relative">

        {#if show_view}
            <View 
                {data}
                {content}
                {is_space}
                {is_space_child_room}
                {non_space_room}
            />
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

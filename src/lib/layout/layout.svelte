<script>
import { 
    PUBLIC_META_IMAGE,
} from '$env/static/public';

import { browser } from '$app/environment'

import { page } from '$app/stores';

import { 
    processHash
} from '$lib/utils/matrix'

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

const hash_params = $derived.by(() => {
    return processHash($page.url.hash)
})

const no_hash = $derived.by(() => {
    if(browser) {
        return location.hash == ""
    }
})

const space_param = $derived.by(() => {
    if($page?.params?.space) {
        return $page.params.space
    }
    if($page?.url?.hash) {
        return hash_params?.space
    }
})

const room_param = $derived.by(() => {
    if($page?.params?.room) {
        return $page.params.room
    }
    if($page?.url?.hash) {
        return hash_params?.room
    }
})


let is_space = $derived(space_param != undefined)
let is_space_child_room = $derived(room_param != undefined)

let non_space_room = $derived($page.route.id?.includes('/(app)/rooms'))

let show_view = $derived(is_space || is_space_child_room || non_space_room)

let root;

$effect(() => {
    console.log($page)
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
        <Switcher />
    </div>

    <div class="content-container grid h-full relative">

        {#if show_view}
            <View 
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

<script>
import Alert from '$lib/alert/alert.svelte'
import Switcher from '$lib/switcher/switcher.svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()
const alert_active = $derived(store.ui.alert?.active)

let {
    data,
    content,
} = $props();

let native_mode = $derived(data?.native_mode)

let root;

$effect(() => {
    console.log("data is", data)
})

</script>


<main class="app grid h-dvh" class:grid-rows-[auto_1fr]={alert_active}>

{#if alert_active}
    <Alert />
{/if}


<div class="root grid grid-cols-[auto_1fr] h-full select-none" bind:this={root}>
    <div class="switcher grid">
        <Switcher />
    </div>
    <div class="view grid h-full">
        {@render content()}
    </div>
</div>

</main>

<style>
</style>

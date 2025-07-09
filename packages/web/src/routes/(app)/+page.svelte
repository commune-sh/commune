<script>
import View from '$ui/view/view.svelte'
import Landing from '$ui/landing/landing.svelte'
import Loading from '$ui/loading/loading.svelte'
import { pushState } from '$app/navigation'
import { browser } from '$app/environment';
import { page } from '$app/state';
import { onMount } from 'svelte'

onMount(() => {
})

let { data } = $props();

import { createStore } from '$ui/store/store.svelte'
const store = createStore()

const authenticated = $derived(store.session.authenticated)

const show_home = $derived.by(() => {
    return page.params.space === undefined &&
        page.params.room === undefined 
})

$effect(() => {
})

</script>

{#if !authenticated}
    <Landing />
{:else if show_home}
{:else}
    <View />
{/if}


<style>
</style>

<script>
import View from '$lib/view/view.svelte'
import Landing from '$lib/landing/landing.svelte'
import Loading from '$lib/loading/loading.svelte'
import { pushState } from '$app/navigation'
import { browser } from '$app/environment';
import { page } from '$app/state';
import { onMount } from 'svelte'

onMount(() => {
})

let { data } = $props();

import { createStore } from '$lib/store/store.svelte'
const store = createStore()

const authenticated = $derived(store.session.authenticated)

const access_token_exists = $derived(data?.access_token_exists)

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

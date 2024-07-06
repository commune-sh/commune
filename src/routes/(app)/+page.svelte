<script>
import Home from '$lib/view/home.svelte'
import Loading from '$lib/loading/loading.svelte'
import { pushState } from '$app/navigation'
import { browser } from '$app/environment';
import { onMount } from 'svelte'

onMount(() => {
})

import AuthView from '$lib/auth/auth-view.svelte'

let { data } = $props();

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const authReady = $derived(store.auth.ready)
const authenticated = $derived(store.auth.authenticated)

const show_home = $derived(authReady && authenticated)

const access_token_exists = $derived(data?.access_token_exists)

$effect(() => {
})

</script>

{#if !access_token_exists && !authenticated}
    <AuthView />
{:else}
    {#if !authReady}
        <Loading />
    {:else if show_home}
        <Home />
    {/if}
{/if}


<style>
</style>

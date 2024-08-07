<script>
import { 
    PUBLIC_META_TITLE,
    PUBLIC_META_IMAGE,
    PUBLIC_META_DESCRIPTION,
} from '$env/static/public';

import '../../app.css'

import { page } from '$app/stores';
let { data, children } = $props()
import Logo from '$lib/logo/logo.svelte'
import { onMount } from 'svelte'
import { goto } from '$app/navigation'

import Listeners from '$lib/listeners/listeners.svelte'
import HomeserverDown from '$lib/alert/homeserver-down.svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()


const authenticated = $derived(store.auth.authenticated)

const login_token = $derived($page.url.searchParams.get('loginToken'))

onMount(() => {
    if(!login_token) {
        store.matrix.getFlows()
    }
})

$effect(() => {
    if(authenticated) {
        goto('/')
    }
})

</script>

<svelte:head>
    <title>{PUBLIC_META_TITLE}</title>
    <meta property="og:title" content={PUBLIC_META_TITLE} />

    <meta property="og:type" content="website" />

    {#if PUBLIC_META_IMAGE}
        <meta property="og:image" content={PUBLIC_META_IMAGE} />
    {/if}
    {#if PUBLIC_META_DESCRIPTION}
        <meta name="description" content={PUBLIC_META_DESCRIPTION}>
        <meta property="og:description" content={PUBLIC_META_DESCRIPTION}>
    {/if}
</svelte:head>

<Listeners />

<HomeserverDown />


<div class="mt-mid flex flex-col h-full items-center select-none text-md">
    <div class="mb-4">
        <Logo is_static={true} />
    </div>
    <div class="flex flex-col max-w-[26rem] w-full px-5">
        {@render children()}
    </div>
</div>

<style>
</style>

<script lang="ts">
import { env } from '$env/dynamic/public';

import '../../app.css'

import type { LayoutProps } from './types';

import { page } from '$app/state';
import Logo from '$lib/logo/logo.svelte'
import { onMount } from 'svelte'
import { goto } from '$app/navigation'

import Listeners from '$lib/listeners/listeners.svelte'
import HomeserverDown from '$lib/alert/homeserver-down.svelte'

let {
    data, 
    children
}: LayoutProps = $props()

import { createStore } from '$lib/store/store.svelte'
const store = createStore()


const authenticated = $derived(store.session.authenticated)

const login_token = $derived(page.url.searchParams.get('loginToken'))

onMount(() => {
    if(!login_token) {
    }
})

$effect(() => {
    if(authenticated) {
        goto('/')
    }
})

let PUBLIC_META_TITLE = $derived.by(() => {
    let PUBLIC_META_TITLE = env?.PUBLIC_META_TITLE
    return PUBLIC_META_TITLE ? PUBLIC_META_TITLE : `Commune - Matrix Communities`
})


let PUBLIC_META_IMAGE = $derived.by(() => {
    let PUBLIC_META_IMAGE = env?.PUBLIC_META_IMAGE
    if(PUBLIC_META_IMAGE) {
        return PUBLIC_META_IMAGE
    }
    return `https://static.commune.sh/card.png`
})

let PUBLIC_META_DESCRIPTION = $derived.by(() => {
    let PUBLIC_META_DESCRIPTION = env?.PUBLIC_META_DESCRIPTION
    return PUBLIC_META_DESCRIPTION ? PUBLIC_META_DESCRIPTION : `Matrix-powered
public communities`
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

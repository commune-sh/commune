<script>
import { page } from '$app/stores';
import { browser } from '$app/environment';
import { pushState } from '$app/navigation'

import { onMount, tick } from 'svelte';
import Login from './login.svelte'
import Signup from './signup.svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let hash = $derived.by(() => {
    return $page.url.hash
})

let ready = $state(false);

let active_view = $derived($page.state?.active_view)

const login_active = $derived(active_view == undefined || 
    active_view == "login")
const signup_active = $derived(active_view == "signup")



$effect(() => {
    console.log($page)
})

onMount(() => {
})

async function init() {
}

</script>


    {#if login_active}
        <Login />
    {:else if signup_active}
        <Signup />
    {/if}

<style>
</style>

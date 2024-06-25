<script>
import { page } from '$app/stores';

import Login from './login.svelte'
import Signup from './signup.svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()


let active_view = $derived($page.state?.active_view)

const login_active = $derived((active_view == undefined) || 
    active_view == "login")
const signup_active = $derived(active_view == "signup")

$effect(() => {
})

</script>

<div class="mt-mid flex flex-col h-full items-center">
    <div class="flex flex-col max-w-[460px] w-full px-5">


    {#if login_active}
        <Login />
    {:else if signup_active}
        <Signup />
    {/if}


    </div>
</div>

<style>
</style>

<script>
import { browser } from '$app/environment';
import { onMount, tick } from 'svelte';
import { page } from '$app/stores';
import { pushState } from '$app/navigation'
import { login } from '$lib/matrix/requests';

import Logo from '$lib/logo/static-logo.svelte'

import Flows from './flows.svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()



let login_flows = $derived(store.auth.login_flows)

async function getLoginFlows() {
    try {
        const response = await login();
        if(response?.flows) {
            store.auth.updateLoginFlows(response.flows)
        }
    } catch (error) {
        console.log(error)
    }
}

onMount(() => {
    if(browser && !login_flows) {
        getLoginFlows()
    }

})

let handle;
let password;


onMount(() => {
    focus()
});

async function focus() {
    await tick();
    handle.focus();
}

function signup() {
    pushState('', {
        active_view: "signup"
    });
}

let is_app_group = $derived($page.route.id == '/(app)')
let is_auth_group = $derived($page.route.id == '/(auth)/login')

</script>

{#if is_auth_group}
    <div class="flex justify-center">
        <Logo />
    </div>
{/if}

<div class="login-container flex flex-col w-[420px] rounded-[4px]
    bg-switcher mt-10 relative
    p-[20px]">

    <div class="flex justify-center">
        <div class="silk">
            Log in
        </div>
    </div>


    <div class="mt-8">
        <input bind:this={handle} type="text" class=""
            placeholder="Email or username">
    </div>
    <div class="mt-6">
        <input bind:this={password} type="password" class=""
            placeholder="Password">
    </div>
    <div class="mt-6 text-xl text-light">
        Need an account? 
        {#if is_app_group}
            <a onclick={signup} class="text-primary cursor-pointer hover:text-text ">Sign up</a>
        {:else}
            <a href="/signup" class="text-primary hover:text-text">Sign up</a>
        {/if}
    </div>
    <div class="mt-6">
        <button class="w-full py-5">Log in</button>
    </div>



</div>

<Flows />



<style>
</style>

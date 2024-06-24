<script>
import { onMount, tick } from 'svelte';
import { page } from '$app/stores';
import { pushState } from '$app/navigation'
import { login, register } from '$lib/matrix/requests';

import Flows from './flows.svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()



let login_flows = $derived(store.auth.login_flows)

let register_flows = $state(null);
let session = $state(null);

let registration_disabled = $state(false)

onMount(() => {
    getRegisterFlows();
    focus()
    if(!login_flows) {
        getLoginFlows()
    }
})

async function focus() {
    await tick();
    usernameInput.focus();
}

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
async function getRegisterFlows() {
    try {
        const response = await register();
        if(response?.flows && response?.session) {
            console.log("Register flows: ", response)
            register_flows = response.flows;
            session = response.session
        }
        if(response?.errcode == "M_FORBIDDEN") {
            registration_disabled = true
        }
    } catch (error) {
        console.log(error)
        /*
        store.ui.activateAlert({
            message: "Can't connect to homeserver.",
            type: "error"
        })
        */
    }
}


let usernameInput;
let emailInput; 
let passwordInput;

let is_app = $derived($page.route.id == '/(app)')

function goToLogin() {
    pushState('', {
        active_view: "login"
    });
}

</script>

<div class="signup-container flex flex-col w-[420px] rounded-[4px]
    bg-switcher mt-10 relative
    p-[20px]">

    <div class="flex justify-center">
        <div class="title silk">
            Create an account
        </div>
    </div>

    <div class="mt-8">
        <input bind:this={usernameInput} type="text" class=""
            placeholder="Username">
    </div>

    <div class="mt-8">
        <input bind:this={emailInput} type="text" class=""
            placeholder="Email">
    </div>

    <div class="mt-6">
        <input bind:this={passwordInput} type="password" class=""
            placeholder="Password">
    </div>

    <div class="mt-6 text-xl text-light">
    </div>

    <div class="mt-6 text-xl text-light">
        Already have an account?
        {#if is_app}
            <a onclick={goToLogin} class="text-primary cursor-pointer
                hover:text-text ">Login</a>
        {:else}
            <a href="/login" class="text-primary hover:text-text">Login</a>
        {/if}
    </div>

    <div class="mt-6">
        <button class="w-full py-5">Create account</button>
    </div>



</div>

<Flows />


<style>
</style>

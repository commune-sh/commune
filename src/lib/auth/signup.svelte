<script>
import { PUBLIC_META_TITLE } from '$env/static/public';
import { onMount, tick } from 'svelte';
import { page } from '$app/stores';
import { pushState } from '$app/navigation'
import { login, register } from '$lib/matrix/requests';
import { eye, eyeSlash } from '$lib/assets/icons'

import Logo from '$lib/logo/static-logo.svelte'

import Flows from './flows.svelte'

import { createStore } from '$lib/store/store.svelte.js'
    import Toggle from '$lib/theme/toggle.svelte';
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
    }
}

// Which register flows exist?

let dummy_flow_exists = $derived.by(() => {
    return register_flows?.find(flow => flow.stages.includes("m.login.dummy"))
    != null
})
let email_flow_exists = $derived.by(() => {
    return register_flows?.find(flow =>
        flow.stages.includes("m.login.email.identity")) != null
})

let email_required = $derived(email_flow_exists && !dummy_flow_exists)
let email_optional = $derived(email_flow_exists && dummy_flow_exists)

let emailPlaceholder = $derived(email_required ? "Email" : "Email (optional)")


let usernameInput;
let emailInput; 
let passwordInput;

let password_visible = $state(false);

let togglePasswordVisibility = () => {
    password_visible = !password_visible;
    passwordInput.type = password_visible ? "text" : "password";
    passwordInput.focus();
}

let is_app_group = $derived($page.route.id == '/(app)')
let is_auth_group = $derived($page.route.id == '/(auth)/signup')

let title = $derived.by(() => {
    return is_auth_group ? `${PUBLIC_META_TITLE} - Login` : PUBLIC_META_TITLE
})

function goToLogin() {
    pushState('', {
        active_view: "login"
    });
}

</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>


<div class="signup-container flex flex-col w-[420px] rounded-[4px]
    bg-switcher mt-10 relative
    p-[20px]">

    <div class="flex justify-center">
        <div class="font-semibold duration-300" 
            class:opacity-20={registration_disabled}>
            Create an account
        </div>
    </div>

    <div class="mt-8">
        <input bind:this={usernameInput} type="text" 
            id="usernmae"
            class="duration-300"
            disabled={registration_disabled}
            placeholder="Username">
    </div>

    {#if email_flow_exists}
    <div class="mt-5">
        <input bind:this={emailInput} type="text" 
            class="duration-300"
            id="email"
            disabled={registration_disabled}
            placeholder={emailPlaceholder}>
    </div>
    {/if}

    <div class="mt-5 relative">
        <input bind:this={passwordInput} type="password" 
            id="password"
            class="duration-300"
            disabled={registration_disabled}
            placeholder="Password">
        <div class="absolute right-0 top-4 mr-4 icon cursor-pointer w-[20px] h-[20px]" 
            onclick={togglePasswordVisibility}>
            {#if password_visible}
                {@html eye}
            {:else}
                {@html eyeSlash}
            {/if}
        </div>
    </div>

    <div class="mt-6 text-xl text-light">
        Already have an account?
        {#if is_app_group}
            <a onclick={goToLogin} class="text-primary cursor-pointer
                hover:text-text ">Login</a>
        {:else}
            <a href="/login" class="text-primary hover:text-text">Login</a>
        {/if}
    </div>

    <div class="mt-6">
        <button class="w-full py-6 duration-100"
            disabled={registration_disabled}>
            Create account
        </button>
    </div>


    {#if registration_disabled}
        <div class="mt-6 text-xl text-light warn text-center">
            Registration has been disabled by the server.
        </div>
    {/if}

    {#if !registration_disabled}
    <Flows />
    {/if}


</div>


<style>
</style>

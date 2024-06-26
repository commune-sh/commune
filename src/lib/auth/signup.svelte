<script>
import { PUBLIC_META_TITLE, PUBLIC_APP_NAME } from '$env/static/public';
import { onMount, tick } from 'svelte';
import { page } from '$app/stores';
import { pushState } from '$app/navigation'
import { login, register, usernameAvailable } from '$lib/matrix/requests';
import { debounce } from '$lib/utils/utils'
import { eye, eyeSlash, close, check } from '$lib/assets/icons'
import { naiveEmailCheck } from '$lib/utils/utils';
import { v7 as uuidv4 } from 'uuid';

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
let requires_token = $derived.by(() => {
    return register_flows?.find(flow =>
        flow.stages.includes("m.login.registration_token")) != null
})
let email_flow_exists = $derived.by(() => {
    return register_flows?.find(flow =>
        flow.stages.includes("m.login.email.identity")) != null
})

let dummy_mode = $derived(dummy_flow_exists && !email_flow_exists)

let email_required = $derived(email_flow_exists && !dummy_flow_exists)
let email_optional = $derived(email_flow_exists && dummy_flow_exists)

let emailPlaceholder = $derived(email_required ? "Email" : "Email (optional)")


let usernameInput;
let username = $state('')
let emailInput; 
let email = $state('')
let passwordInput;
let password = $state('')

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

let checking = $state(false);
let username_available = $state(false);
let username_unavailable = $state(false);

function checkUsername(e) {
    debounce(async() => {
        username_available = false;
        username_unavailable = false;
        if(username?.length == 0) return
        checking = true;
        let response = await usernameAvailable(username);
        if(response?.errcode == "M_USER_IN_USE") {
            username_unavailable = true;
        } else if(response?.available) {
            username_available = true;
        }
        checking = false;
    }, 350)
}

function reset() {
    username_available = false
}

let bad_password = $state(false);

let bad_email = $derived.by(() => {
    return email != '' &&  naiveEmailCheck(email) == false
})

let showEmailWarning = $state(false)

function checkEmail() {
    showEmailWarning = false
    debounce(() => {
        if(email != '' && !naiveEmailCheck(email)) {
            showEmailWarning = true
        }
    }, 500)
}

let busy = $state(false);

let failed = $state(false);

let wait_for_email_verification = $state(false);

async function createAccount() {
    busy = true

    if(username == '' || username_unavailable) {
        usernameInput.focus()
        busy = false
        return
    }

    if(email_required && email == '') {
        emailInput.focus()
        busy = false
        return
    }

    if(!dummy_mode) {
        let email_like = naiveEmailCheck(email)
        if(!email_like) {
            emailInput.focus()
            busy = false
            return
        }
    }

    if(password?.length < 8) {
        bad_password = true
        passwordInput.focus()
        busy = false
        return
    }
    if(dummy_mode) {
        createDummyAccount(username, password)
    }
}

async function createDummyAccount(username, password) {
    // create account
    const response = await register({
        initial_device_display_name: PUBLIC_APP_NAME,
        username: username,
        password: password
    });

    if(response?.session) {
        console.log("Register response ", response)
        session = response.session
    } else {
        failed = true
        busy = false
        return
    }
    const resp = await register({
        auth: {
            session: session,
            type: "m.login.dummy"
        },
        initial_device_display_name: PUBLIC_APP_NAME,
        username: username,
        password: password
    });
    if(resp?.access_token && resp?.user_id && resp?.device_id) {
        console.log(resp)
        store.auth.saveSession({
            access_token: resp.access_token,
            user_id: resp.user_id,
            device_id: resp.device_id,
            home_server: resp.home_server,
        })
        session = null
    } else {
        failed = true
        busy = false
        return
    }
}

function updatePassword() {
    if(passwordInput.value?.length >= 8) {
        bad_password = false
    }
}


function handleEnter(e) {
    if(e.key == 'Enter') {
        createAccount()
    }
}


</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>


<div class="signup-container flex flex-col rounded-[4px]
    bg-switcher mt-10 relative
    p-[20px]">

    <div class="flex justify-center">
        <div class="font-semibold duration-300" 
            class:opacity-20={registration_disabled}>
            Create an account
        </div>
    </div>

    <div class="mt-8 relative">
        <input bind:this={usernameInput} type="text" 
            bind:value={username}
            id="username"
            class="duration-300"
            class:fail={username_unavailable}
            oninput={checkUsername}
            onkeypress={reset}
            autocomplete="off"
            disabled={registration_disabled || busy}
            placeholder="Username">
        {#if checking}
            <div class="absolute top-5 right-6">
                <div class="spinner border-primary"></div>
            </div>
        {/if}
        {#if username_available}
            <div class="absolute right-0 top-5 mr-4 stroke-white h-[18px] w-[18px]">
                {@html check}
            </div>
        {/if}
    </div>

    <div class="mt-5" class:hidden={dummy_mode}>
        <input bind:this={emailInput} type="text" 
            bind:value={email}
            class:fail={showEmailWarning}
            class="duration-300"
            oninput={checkEmail}
            id="email"
            disabled={registration_disabled || busy}
            placeholder={emailPlaceholder}>
    </div>

    <div class="mt-5 relative">
        <input bind:this={passwordInput} type="password" 
            bind:value={password}
            id="password"
            class="duration-300"
            disabled={registration_disabled || busy}
            class:fail={bad_password}
            oninput={updatePassword}
            onkeypress={handleEnter}
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

    <div class="mt-6 relative">
        <button class="w-full py-5 duration-100"
            onclick={createAccount}
            disabled={registration_disabled || busy}>
            {busy ? `Creating account` : `Create account`}
        </button>
        {#if busy}
            <div class="absolute top-5 right-6">
                <div class="spinner border-primary"></div>
            </div>
        {/if}
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

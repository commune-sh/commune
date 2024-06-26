<script>
import { PUBLIC_META_TITLE, PUBLIC_APP_NAME } from '$env/static/public';
import { browser } from '$app/environment';
import { onMount, tick } from 'svelte';
import { page } from '$app/stores';
import { pushState } from '$app/navigation'
import { login } from '$lib/matrix/requests';
import { naiveEmailCheck } from '$lib/utils/utils';

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

let handleInput;
let username_or_email = $state('');
let passwordInput;
let password = $state('')


onMount(() => {
    focus()
});

async function focus() {
    await tick();
    handleInput.focus();
}

function signup() {
    pushState('', {
        active_view: "signup"
    });
}

let is_app_group = $derived($page.route.id == '/(app)')
let is_auth_group = $derived($page.route.id == '/(auth)/login')

let title = $derived.by(() => {
    return is_auth_group ? `${PUBLIC_META_TITLE} - Login` : PUBLIC_META_TITLE
})

let busy = $state(false);
let failed = $state(false);

let bad_password = $state(false);
let bad_credentials = $state(false);


let possibly_email = $derived.by(() => {
    return naiveEmailCheck(username_or_email)
})

async function startLogin() {
    bad_credentials = false
    busy = true

    let username = handleInput.value
    let password = passwordInput.value

    if(username == '') {
        handleInput.focus()
        busy = false
        return
    }
    if(password?.length < 8) {
        bad_password = true
        passwordInput.focus()
        busy = false
        return
    }

    let body = {
        identifier: {
            type: "m.id.user",
            user: username
        },
        initial_device_display_name: PUBLIC_APP_NAME,
        password: password,
        type: "m.login.password",
    }

    if(possibly_email) {
        body.identifier = {
            type: "m.id.thirdparty",
            medium: "email",
            address: username
        }
    }

    const resp = await login(body);

    if(resp?.errcode == "M_FORBIDDEN") {
        bad_credentials = true
        busy = false
        await tick()
        handleInput.focus()
        return
    }
    if(resp?.access_token && resp?.user_id && resp?.device_id) {
        console.log(resp)
        store.auth.saveSession({
            access_token: resp.access_token,
            user_id: resp.user_id,
            device_id: resp.device_id,
            home_server: resp.home_server,
        })
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


function goToPassword(e) {
    if(e.key == 'Enter' && handleInput.value?.length > 0) {
        passwordInput.focus()
    }
}
function handleEnter(e) {
    if(e.key == 'Enter') {
        startLogin()
    }
}

</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>

{__VERSION__}
{__COMMIT__}

<div class="login-container flex flex-col rounded-[4px]
    bg-switcher mt-10 relative
    p-[20px]">

    <div class="flex justify-center">
        <div class="font-semibold duration-300">
            Log in to {PUBLIC_APP_NAME}
        </div>
    </div>



    <div class="mt-8">
        <input bind:this={handleInput} type="text" class=""
            bind:value={username_or_email}
            id="handleInput"
            autocomplete="off"
            placeholder="Email or username"
            onkeypress={goToPassword}
            disabled={busy}>
    </div>
    <div class="mt-5">
        <input bind:this={passwordInput} type="password" 
            id="password"
            class="duration-300"
            class:fail={bad_password}
            oninput={updatePassword}
            onkeypress={handleEnter}
            placeholder="Password"
            disabled={busy}>
    </div>
    <div class="mt-6 text-xl text-light">
        Need an account? 
        {#if is_app_group}
            <a onclick={signup} class="text-primary cursor-pointer hover:text-text ">Sign up</a>
        {:else}
            <a href="/signup" class="text-primary hover:text-text">Sign up</a>
        {/if}
    </div>

    <div class="mt-6 relative">
        <button class="w-full py-5 duration-100"
            onclick={startLogin}
            disabled={busy}>
            {busy ? `Loggin in` : `Log in`}
        </button>
        {#if busy}
            <div class="absolute top-5 right-6">
                <div class="spinner border-primary"></div>
            </div>
        {/if}
    </div>


    <Flows {busy} />


</div>

{#if bad_credentials}
<div class="mt-4 px-[20px] py-3 bg-shade-2 
    border border-primary
    rounded-[4px] text-xl warn
    text-center">

        {#if possibly_email}
            Incorrect email or password.
        {:else}
            Incorrect username or password.
        {/if}
</div>
{/if}



<style>
</style>

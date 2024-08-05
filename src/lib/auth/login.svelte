<script>
import { PUBLIC_META_TITLE, PUBLIC_APP_NAME } from '$env/static/public';
import { onMount, tick } from 'svelte';
import { page } from '$app/stores';
import { pushState } from '$app/navigation'
import { naiveEmailCheck } from '$lib/utils/utils';
import { eye, eyeSlash, check } from '$lib/assets/icons'

import Flows from './flows.svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const homeserver_reachable = $derived(store.app.homeserver_reachable)

onMount(() => {
})

let handleInput;
let username_or_email = $state('');
let passwordInput;
let password = $state('')


onMount(() => {
    if(handleInput) {
        focus()
    }
});

async function focus() {
    await tick();
    if(handleInput) {
        handleInput.focus();
    }
}

function signup() {
    pushState('', {
        active_view: "signup"
    });
}

function forgot_password() {
    pushState('', {
        active_view: "password"
    });
}

let password_visible = $state(false);

let togglePasswordVisibility = () => {
    password_visible = !password_visible;
    passwordInput.type = password_visible ? "text" : "password";
    passwordInput.focus();
}

let is_app_group = $derived($page.route.id == '/(app)')
let is_auth_group = $derived($page.route.id == '/(auth)/login')

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

    if(username_or_email == '') {
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
            user: username_or_email
        },
        initial_device_display_name: PUBLIC_APP_NAME,
        password: password,
        type: "m.login.password",
    }

    if(possibly_email) {
        body.identifier = {
            type: "m.id.thirdparty",
            medium: "email",
            address: username_or_email
        }
    }

    try {
        let resp = await store.matrix.client.login("m.login.password", body)
        console.log(resp)

        if(resp?.access_token && resp?.user_id && resp?.device_id) {
            console.log(resp)
            store.auth.saveSession({
                access_token: resp.access_token,
                user_id: resp.user_id,
                device_id: resp.device_id,
                home_server: resp.home_server,
            })
        }

    } catch (error) {
        if(error?.errcode == "M_FORBIDDEN") {
            bad_credentials = true
            busy = false
            await tick()
            handleInput.focus()
            return
        }
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

<div class="login-container container flex flex-col rounded-[4px]
    relative">

    <div class="flex justify-center">
        <div class="font-semibold text-xl"
            class:opacity-20={!homeserver_reachable}>
            Log in 
        </div>
    </div>



    <div class="mt-6">
        <label class="hide-label" for="handleInput">Username or email</label>
        <input bind:this={handleInput} type="text" class=""
            bind:value={username_or_email}
            id="handleInput"
            autocomplete="off"
            placeholder="Username or email"
            onkeypress={goToPassword}
            spellcheck="false"
            disabled={busy || !homeserver_reachable}>
    </div>

    <div class="mt-3 relative">
        <label class="hide-label" for="password">Password</label>
        <input bind:this={passwordInput} type="password" 
            bind:value={password}
            id="password"
            class=""
            class:fail={bad_password}
            oninput={updatePassword}
            onkeypress={handleEnter}
            placeholder="Password"
            disabled={busy || !homeserver_reachable}>
        <div class="absolute right-0 top-3 mr-3 icon cursor-pointer w-[1.2rem]
            h-[1.2rem]" 
            onclick={togglePasswordVisibility}>
            {#if password_visible}
                {@html eye}
            {:else}
                {@html eyeSlash}
            {/if}
        </div>

    </div>

    <div class="mt-3 text-xs">
        {#if is_app_group}
            <a onclick={forgot_password} class="text-primary cursor-pointer
                hover:text-text " tabindex="0">Forgot password?</a>
        {:else}
            <a href="/password" class="text-primary hover:text-text" tabindex="0">Forgot
                password?</a>
        {/if}
    </div>


    <div class="mt-4 relative">
        <button class="w-full py-3"
            onclick={startLogin}
            disabled={busy || !homeserver_reachable}>
            {busy ? `Logging in` : `Log in`}
        </button>
        {#if busy}
            <div class="absolute top-3 right-3">
                <div class="spinner border-primary"></div>
            </div>
        {/if}
    </div>

    <div class="mt-4 text-xs text-light text-center">
        Don't have an account?
        {#if is_app_group}
            <a onclick={signup} class="text-primary cursor-pointer hover:text-text " tabindex="0">Sign up</a>
        {:else}
            <a href="/signup" class="text-primary hover:text-text" tabindex="0">Sign up</a>
        {/if}
    </div>


    {#if homeserver_reachable}
        <Flows {busy} />
    {/if}


</div>

{#if bad_credentials}
<div class="mt-4 py-2
    border border-primary
    rounded-[4px] text-sm warn
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

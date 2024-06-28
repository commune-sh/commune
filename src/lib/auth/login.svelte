<script>
import { PUBLIC_META_TITLE, PUBLIC_APP_NAME } from '$env/static/public';
import { onMount, tick } from 'svelte';
import { page } from '$app/stores';
import { pushState } from '$app/navigation'
import { naiveEmailCheck } from '$lib/utils/utils';

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

function forgot_password() {
    pushState('', {
        active_view: "password"
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

<svelte:head>
    <title>{title}</title>
</svelte:head>

<div class="login-container flex flex-col rounded-[4px]
    bg-switcher mt-10 relative
    p-[20px]">

    <div class="mt-1 flex justify-center">
        <div class="font-semibold duration-300"
            class:opacity-20={!homeserver_reachable}>
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
            disabled={busy || !homeserver_reachable}>
    </div>
    <div class="mt-5">
        <input bind:this={passwordInput} type="password" 
            bind:value={password}
            id="password"
            class="duration-300"
            class:fail={bad_password}
            oninput={updatePassword}
            onkeypress={handleEnter}
            placeholder="Password"
            disabled={busy || !homeserver_reachable}>
    </div>

    <div class="mt-6 text-xl">
        {#if is_app_group}
            <a onclick={forgot_password} class="text-primary cursor-pointer
                hover:text-text ">Forgot password?</a>
        {:else}
            <a href="/password" class="text-primary hover:text-text">Forgot
                password?</a>
        {/if}
    </div>


    <div class="mt-6 relative">
        <button class="w-full py-5 duration-100"
            onclick={startLogin}
            disabled={busy || !homeserver_reachable}>
            {busy ? `Loggin in` : `Log in`}
        </button>
        {#if busy}
            <div class="absolute top-5 right-6">
                <div class="spinner border-primary"></div>
            </div>
        {/if}
    </div>

    <div class="mt-6 text-xl text-light text-center">
        Don't have an account?
        {#if is_app_group}
            <a onclick={signup} class="text-primary cursor-pointer hover:text-text ">Sign up</a>
        {:else}
            <a href="/signup" class="text-primary hover:text-text">Sign up</a>
        {/if}
    </div>


    {#if homeserver_reachable}
        <Flows {busy} />
    {/if}


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

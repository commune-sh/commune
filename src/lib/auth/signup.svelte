<script>
import { PUBLIC_META_TITLE, PUBLIC_APP_NAME } from '$env/static/public';
import { onMount, tick } from 'svelte';
import { page } from '$app/stores';
import { pushState } from '$app/navigation'
import { register, requestToken } from '$lib/matrix/requests';
import { debounce } from '$lib/utils/utils'
import { eye, eyeSlash, check } from '$lib/assets/icons'
import { naiveEmailCheck } from '$lib/utils/utils';
import { v4 as uuidv4 } from 'uuid';


import Flows from './flows.svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const homeserver_reachable = $derived(store.app.homeserver_reachable)


let register_flows = $derived(store.matrix.register_flows)
let register_flows_fetched = $derived(store.matrix.register_flows != null)
let session = $state(null);

let registration_disabled = $derived(store.matrix.registration_disabled)

onMount(() => {
    focus()
})

async function focus() {
    await tick();
    usernameInput.focus();
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

let emailPlaceholder = $derived(email_optional ? "Email (optional)" : "Email")



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
    return is_auth_group ? `${PUBLIC_META_TITLE} - Sign up` : PUBLIC_META_TITLE
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


        try {
            let available = await store.matrix.client.isUsernameAvailable(username)
            if(available) {
                username_available = true;
            } else {
                username_unavailable = true;
            }
        } catch(err) {
            console.warn(err)
            username_unavailable = true;
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

    if(email_flow_exists && email != "") {
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


    if(dummy_mode || email_optional) {
        createDummyAccount(username, password)
    }

    if(email_required) {
        createEmailAccount()
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

async function createEmailAccount() {

    let client_secret = uuidv4();

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

    const tokenResponse = await requestToken({
        client_secret: client_secret,
        email: email,
        send_attempt: 1
    });

    let sid;

    if(tokenResponse?.sid) {
        sid = tokenResponse.sid

        let body = {
            auth: {
                type: "m.login.email.identity",
                session: session,
                threepid_creds: {
                    client_secret: client_secret,
                    sid: sid
                }
            },
            initial_device_display_name: PUBLIC_APP_NAME,
            username: username,
            password: password
        }

        loopRegister(body)
    }
}


async function loopRegister(body) {
    const response = await register(body);

    if(!response?.user_id || !response?.access_token) {
        setTimeout(() => {
            loopRegister(body)
        }, 1000)
    } else {
        console.log(response)
        store.auth.saveSession({
            access_token: response.access_token,
            user_id: response.user_id,
            device_id: response.device_id,
            home_server: response.home_server,
        })
        session = null
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

<div class="signup-container container flex flex-col rounded-[4px]
    relative">

    <div class="flex justify-center">
        <div class="font-semibold text-xl">
            Create an account
        </div>
    </div>

    <div class="mt-6 relative">
        <input bind:this={usernameInput} type="text" 
            bind:value={username}
            id="username"
            class=""
            class:fail={username_unavailable}
            oninput={checkUsername}
            onkeypress={reset}
            autocomplete="off"
            disabled={registration_disabled || busy || !homeserver_reachable}
            placeholder="Username">

        {#if checking}
            <div class="absolute top-[0.8rem] right-4">
                <div class="spinner border-primary"></div>
            </div>
        {/if}

        {#if username_available}
            <div class="absolute right-0 top-[0.8rem] mr-4 stroke-white h-[18px] w-[18px]">
                {@html check}
            </div>
        {/if}
    </div>

    <div class="mt-3" class:hidden={dummy_mode}>
        <input bind:this={emailInput} type="text" 
            bind:value={email}
            class:fail={showEmailWarning}
            class=""
            oninput={checkEmail}
            id="email"
            autocomplete="off"
            disabled={registration_disabled || busy || !homeserver_reachable}
            placeholder={emailPlaceholder}>
    </div>

    <div class="mt-3 relative">
        <input bind:this={passwordInput} type="password" 
            bind:value={password}
            id="password"
            class=""
            disabled={registration_disabled || busy || !homeserver_reachable}
            class:fail={bad_password}
            oninput={updatePassword}
            onkeypress={handleEnter}
            autocomplete="off"
            placeholder="Password">

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

    <div class="mt-4 text-xs text-light">
        Already have an account?
        {#if is_app_group}
            <a onclick={goToLogin} class="text-primary cursor-pointer
                hover:text-text" tabindex="0">Login</a>
        {:else}
            <a href="/login" class="text-primary hover:text-text" tabindex="0">Login</a>
        {/if}
    </div>

    <div class="mt-4 relative">
        <button class="w-full py-3 "
            onclick={createAccount}
            disabled={registration_disabled || busy || !homeserver_reachable}>
            {busy ? `Creating account` : `Create account`}
        </button>
        {#if busy}
            <div class="absolute top-5 right-6">
                <div class="spinner border-primary"></div>
            </div>
        {/if}
    </div>


    {#if homeserver_reachable && register_flows_fetched && !registration_disabled}
        <Flows />
    {/if}

    {#if !register_flows_fetched && !registration_disabled && homeserver_reachable}
        <div class="absolute top-[0.4rem] right-1">
            <div class="spinner border-primary"></div>
        </div>
    {/if}

</div>

{#if registration_disabled}
    <div class="mt-4 px-[2rem] py-3 
        border border-primary
        rounded-[4px] warn
        text-center">
        Registration has been disabled.
    </div>
{/if}

<style>

</style>

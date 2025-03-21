<script>
import { onMount, tick } from 'svelte';
import { page } from '$app/stores';
import { debounce } from '$lib/utils/utils'
import { naiveEmailCheck } from '$lib/utils/utils';
import { pushState } from '$app/navigation'
import { savePassword, requestPasswordToken } from '$lib/matrix/requests';
import { v4 as uuidv4 } from 'uuid';
import { eye, eyeSlash, check } from '$lib/assets/icons'

import { createStore } from '$lib/store/store.svelte'
const store = createStore()

const homeserver_reachable = $derived(store.app.homeserver_reachable)

let register_flows = $derived(store.matrix.register_flows)

let register_flows_fetched = $derived(store.matrix.register_flows != null)
let email_flow_exists = $derived.by(() => {
    return register_flows?.find(flow =>
        flow.stages.includes("m.login.email.identity")) != null
})

onMount(() => {
    if(emailInput) {
        focus()
    }
})

async function focus() {
    await tick();
    emailInput.focus();
}

let busy = $state(false);

let emailInput; 
let email = $state('')

let showEmailWarning = $state(false)

function checkEmail() {
    showEmailWarning = false
    debounce(() => {
        if(email != '' && !naiveEmailCheck(email)) {
            showEmailWarning = true
        }
    }, 500)
}

let send_attempt = $state(0);

let sid = $state(null);

let email_sent = $state(true);

async function sendEmail() {
    busy = true
    if(email == '') {
        busy = false
        showEmailWarning = true
        focus()
        return
    }
    if(!naiveEmailCheck(email)) {
        showEmailWarning = true
        busy = false
        return
    }

    let client_secret = uuidv4();

    send_attempt += 1

    const tokenResponse = await requestPasswordToken({
        client_secret: client_secret,
        email: email,
        send_attempt: send_attempt
    });

    if(tokenResponse?.sid) {
        sid = tokenResponse.sid

        email_sent = true
        busy = false

    }

}

let is_app_group = $derived($page.route.id == '/(app)')
let is_auth_group = $derived($page.route.id == '/(auth)/signup')
function goToLogin() {
    pushState('', {
        active_view: "login"
    });
}

let resetting = $state(false);

async function goToNext() {
    resetting = true
    await tick();
    passwordInput.focus();
}

let passwordInput;
let password = $state('')
let bad_password = $state(false);

let password_visible = $state(false);
let togglePasswordVisibility = () => {
    password_visible = !password_visible;
    passwordInput.type = password_visible ? "text" : "password";
    passwordInput.focus();
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
        resetPassword()
    }
}

function resetPassword() {

}

</script>

{#if !email_sent}
<div class="container flex flex-col relative">

    <div class="mt-1 flex justify-center">
        <div class="font-semibold text-xl">
            Reset Password
        </div>
    </div>

    <div class="mt-6 leading-6">
        Enter your email to reset your password. We'll send you a confirmation email.
    </div>

    <div class="relative mt-6">
        <label class="hide-label" for="email">Email</label>
        <input bind:this={emailInput} type="text" 
            bind:value={email}
            class:fail={showEmailWarning}
            class=""
            oninput={checkEmail}
            id="email"
            autocomplete="off"
            disabled={!homeserver_reachable}
            spellcheck="false"
            placeholder="Email">
    </div>

    <div class="mt-4 relative">
        <button class="w-full py-3 "
            onclick={sendEmail}
            disabled={!homeserver_reachable || busy}>
            {busy ? `Sending email` : `Send email`}
        </button>
        {#if busy}
            <div class="absolute top-3 right-3">
                <div class="spinner border-primary"></div>
            </div>
        {/if}
    </div>

    <div class="mt-4 text-xs text-light">
        {#if is_app_group}
            <a onclick={goToLogin} class="text-primary cursor-pointer
                hover:text-text" tabindex="0"> Back to Login</a>
        {:else}
            <a href="/login" class="text-primary hover:text-text" tabindex="0">
                Back to login</a>
        {/if}
    </div>

</div>

{:else if resetting}

<div class="container flex flex-col relative">

    <div class="mt-1 flex justify-center">
        <div class="font-semibold text-xl">
            Reset Password
        </div>
    </div>

    <div class="mt-6 leading-6">
        Choose a new password for your account.
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

    <div class="mt-4 relative">
        <button class="w-full py-3 "
            onclick={resetPassword}
            disabled={!homeserver_reachable}>
                Reset Password
        </button>
    </div>

</div>


{:else}

<div class="container flex flex-col relative">

    <div class="mt-1 flex justify-center">
        <div class="font-semibold text-xl">
            Check your email
        </div>
    </div>

    <div class="mt-6 leading-6">
        We sent you an email at {email}. Follow the instructions in the email to reset your password.
    </div>

    <div class="mt-4 relative">
        <button class="w-full py-3 "
            onclick={goToNext}
            disabled={!homeserver_reachable}>
            Next
        </button>
    </div>


</div>
{/if}

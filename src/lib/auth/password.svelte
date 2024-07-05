<script>
import { onMount, tick } from 'svelte';
import { page } from '$app/stores';
import { debounce } from '$lib/utils/utils'
import { naiveEmailCheck } from '$lib/utils/utils';
import { pushState } from '$app/navigation'
import { register, requestToken } from '$lib/matrix/requests';
import { v4 as uuidv4 } from 'uuid';

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const homeserver_reachable = $derived(store.app.homeserver_reachable)

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

let email_sent = $state(false);

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

    const tokenResponse = await requestToken({
        client_secret: client_secret,
        email: email,
        send_attempt: send_attempt
    });
    if(tokenResponse?.sid) {
        sid = tokenResponse.sid
    }

}

let is_app_group = $derived($page.route.id == '/(app)')
let is_auth_group = $derived($page.route.id == '/(auth)/signup')
function goToLogin() {
    pushState('', {
        active_view: "login"
    });
}
</script>

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
            disabled={!homeserver_reachable}>
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

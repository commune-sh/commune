<script>
import { page } from '$app/stores';

import Token from './token.svelte'
import Login from './login.svelte'
import Signup from './signup.svelte'
import Password from './password.svelte'

import { createStore } from '$lib/store/store.svelte'
const store = createStore()


let active_view = $derived($page.state?.active_view)

const login_active = $derived((active_view == undefined) || 
    active_view == "login")

const signup_active = $derived(active_view == "signup")

const has_login_token = $derived.by(() => {
    let loginToken = $page.url.searchParams.get('loginToken')
    return loginToken != null
})

const password_active = $derived(active_view == "password")

const oidc_enabled = $derived.by(() => {
    return store.matrix.oidc_issuer != null
})

$effect(() => {
})

</script>

<div class="auth-view bg-view">
<div class="mt-mid flex flex-col h-full items-center">
    <div class="flex flex-col max-w-[26rem] w-full px-5">

    {#if login_active}
        <Login />
    {:else if signup_active}
        <Signup />
    {:else if password_active}
        <Password />
    {/if}


    </div>
</div>
</div>

<style>
</style>

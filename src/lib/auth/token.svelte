<script lang="ts">
import { PUBLIC_APP_NAME } from '$env/static/public';
import { page } from '$app/state';
import { exchangeForToken } from '$lib/matrix/requests';
import { goto } from '$app/navigation';

import { onMount } from 'svelte';
import { createStore } from '$lib/store/store.svelte'
const store = createStore()

let {
    data
}: {
    data: any
} = $props();

$effect(() => {
    if(data) {
        console.log(data)
    }
})


let busy = $state(true);
let failed = $state(false);

const token_endpoint = $derived(data?.auth_metadata?.token_endpoint)

const login_token = $derived(data?.loginToken)

const callback_state = $derived(data?.state)
const callback_code = $derived(data?.code)

async function validateCompatToken() {

    console.log("validating token", login_token)

    try {
        let resp = await store.matrix.client.login("m.login.token", {
            initial_device_display_name: PUBLIC_APP_NAME,
            token: login_token,
            type: "m.login.token",
        })

        if(resp?.access_token && resp?.user_id && resp?.device_id) {
            console.log(resp)

            const res = await fetch('/api/auth/session', {
                method: 'POST',
                body: JSON.stringify({
                    access_token: resp.access_token,
                    device_id: resp.device_id,
                    user_id: resp.user_id,
                }),
            });

            const json = await res.json();

            console.log("resp", json)

            /*
            store.auth.saveSession({
                access_token: resp.access_token,
                user_id: resp.user_id,
                device_id: resp.device_id,
                home_server: resp.home_server,
            })
            */
            goto('/')
        }

    } catch (error) {
        console.log(error)
        if(error?.errcode == "M_FORBIDDEN") {
            failed = true
            busy = false
            return
        }
    }

}

async function getAccessToken() {

    console.log("Fetching access token.")

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', callback_code);
    params.append('redirect_uri', "http://localhost:5173/oidc/callback");
    params.append('client_id', data.oidc_client_id);
    params.append('code_verifier', data.oidc_code_verifier);

    try {
        let resp = await exchangeForToken(token_endpoint, params)
        console.log(resp)
        if(resp?.access_token && resp?.refresh_token) {
            const res = await fetch('/api/auth/token', {
                method: 'POST',
                body: JSON.stringify({
                    access_token: resp.access_token,
                    refresh_token: resp.refresh_token,
                    expires_in: resp.expires_in,
                }),
            });

            const json = await res.json();
            console.log("Tokens stored?", json)
            goto('/')
        }
    } catch (error) {
    }

}

onMount(() => {
    if(login_token) {
        validateCompatToken()
    }
    if(token_endpoint && callback_code) {
        getAccessToken()
    }
})

</script>

<div class="signup-container container grid rounded-[4px] place-items-center
    mt-10 relative 
    p-[20px]">

    <div class="flex">

        {#if busy}

        <div class="spinner border-primary"></div>
        <div class="ml-6">
            Authenticating...
        </div>

        {:else if failed}
            <span class="warn">
                Something went wrong.
            </span>
        {/if}

    </div>

</div>

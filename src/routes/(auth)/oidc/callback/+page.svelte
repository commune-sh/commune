<script lang="ts">
import { page } from '$app/state';
import { PUBLIC_BASE_URL } from '$env/static/public';
import { exchangeForToken, whoami } from '$lib/matrix/requests';
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

async function getAccessToken() {

    console.log("Fetching access token.")

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', callback_code);
    params.append('redirect_uri', `${PUBLIC_BASE_URL}/oidc/callback`);
    params.append('client_id', data.oidc_client_id);
    params.append('code_verifier', data.oidc_code_verifier);

    try {
        let resp = await exchangeForToken(token_endpoint, params)
        console.log(resp)
        if(resp?.access_token && resp?.refresh_token) {

            let user = await whoami(resp.access_token) 

            let expires_in = Date.now() + (resp.expires_in * 1000)

            const res = await fetch('/api/auth/token', {
                method: 'POST',
                body: JSON.stringify({
                    access_token: resp.access_token,
                    refresh_token: resp.refresh_token,
                    scope: resp.scope,
                    expires_in: expires_in,
                    user_id: user.user_id,
                    device_id: user.device_id,
                }),
            });

            const json = await res.json();
            console.log("Tokens stored?", json)
            goto('/')
        }
    } catch (error) {
        console.error("Error storing access token:", error);
        failed = true;
    }

}

onMount(() => {
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

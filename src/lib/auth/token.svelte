<script>
import { PUBLIC_APP_NAME } from '$env/static/public';
import { page } from '$app/stores';
import { login } from '$lib/matrix/requests';
import { goto } from '$app/navigation';

import { onMount } from 'svelte';
import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()


let busy = $state(true);
let failed = $state(false);

const login_token = $derived($page.url.searchParams.get('loginToken'))

async function validateToken() {
    const resp = await login({
        initial_device_display_name: PUBLIC_APP_NAME,
        token: login_token,
        type: "m.login.token",
    })
    if(resp?.errcode == "M_FORBIDDEN") {
        failed = true
        busy = false
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
        goto('/')
    } else {
        failed = true
        busy = false
        return
    }
}

onMount(() => {
    if(login_token) {
        validateToken()
    }
})

</script>

<div class="signup-container grid rounded-[4px] place-items-center
    bg-switcher mt-10 relative h-[300px]
    p-[20px]">

    <div class="flex">

        {#if busy}

        <div class="spinner border-primary"></div>
        <div class="ml-6">
            Authenticating...
        </div>

        {:else if failed}
            Something went wrong.
        {/if}

    </div>

</div>

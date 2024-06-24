<script>
import { browser } from '$app/environment';
import { onMount, tick } from 'svelte';
import { goto } from '$app/navigation';

import { register } from '$lib/matrix/requests';

let register_flows = $state(null);
let session = $state(null);

let registration_disabled = $state(false)

onMount(() => {
    getRegisterFlows();
})

async function getRegisterFlows() {
    try {
        const response = await register();
        if(response?.flows && response?.session) {
            console.log("Register flows: ", response)
            register_flows = response.flows;
            session = response.session
        }
        if(response?.errcode == "M_FORBIDDEN") {
            registration_disabled = true
        }
    } catch (error) {
        console.log(error)
        /*
        store.ui.activateAlert({
            message: "Can't connect to homeserver.",
            type: "error"
        })
        */
    }
}
</script>

<div class="auth-view flex flex-col h-full items-center">
    <div class="flex flex-col">
        <div class="">
            signup
        </div>
    </div>
</div>

<style>
.auth-view {
    margin-top: calc(50vh / 2);
}
</style>

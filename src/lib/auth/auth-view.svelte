<script>
import { page } from '$app/stores';
import { browser } from '$app/environment';
import { 
    login,
    register
} from '$lib/matrix/requests';
import { onMount, tick } from 'svelte';
import Login from './login.svelte'
import Signup from './signup.svelte'

import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

const login_active = $derived($page.params?.auth == "login")
const signup_active = $derived($page.params?.auth == "signup")


let login_flows = $state(null);
let register_flows = $state(null);
let session = $state(null);

$effect(() => {
})


onMount(() => {
    getLoginFlows();
    getRegisterFlows();
})

async function getLoginFlows() {
    try {
        const response = await login();
        if(response?.flows) {
            login_flows = response.flows;
            console.log("Login flows: ", login_flows)
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
async function getRegisterFlows() {
    try {
        const response = await register();
        if(response?.flows && response?.session) {
            console.log("Register flows: ", response)
            register_flows = response.flows;
            session = response.session
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
    {#if login_active}
        <Login {login_flows} {register_flows} />
    {:else if signup_active}
        <Signup {login_flows} {register_flows} {session} />
    {/if}
    </div>
</div>

<style>
.auth-view {
    margin-top: calc(50vh / 2);
}
</style>

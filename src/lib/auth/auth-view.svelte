<script>
import { onMount } from 'svelte';
import { login } from '$lib/matrix/requests';
import Loading from '$lib/loading/loading.svelte'
import Login from './login.svelte'
import Signup from './signup.svelte'

// UI store
import { createUIStore } from '$lib/store/ui.svelte.js'
const ui_store = createUIStore()

let active = $state("login")

const login_active = $derived(active == 'login');
const signup_active = $derived(active == 'signup');

let ready = $state(false);

let flows = $state(null);

async function getFlows() {
    try {
        const response = await login();
        if(response?.flows) {
            flows = response.flows;
            console.log("Login flows: ", flows)
            ready = true;
        }
    } catch (error) {
        console.log(error)
        /*
        ui_store.activateAlert({
            message: "Can't connect to homeserver.",
            type: "error"
        })
        */
    }
}

onMount(() => {
    getFlows();
})

</script>




<div class="loading flex h-full justify-center items-center">
    <div>
        {#if login_active}
            <Login />
        {:else if signup_active}
            <Signup />
        {/if}
    </div>
</div>


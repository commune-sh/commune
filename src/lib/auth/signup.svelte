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
    focus()
})

async function focus() {
    await tick();
    usernameInput.focus();
}

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


let usernameInput;
let emailInput; 
let passwordInput;

</script>

<div class="signup-container flex flex-col w-[420px] rounded-[4px]
    bg-switcher mt-10 relative
    p-[20px]">

    <div class="flex justify-center">
        <div class="title silk">
            Create an account
        </div>
    </div>

    <div class="mt-8">
        <input bind:this={usernameInput} type="text" class=""
            placeholder="Username">
    </div>

    <div class="mt-8">
        <input bind:this={emailInput} type="text" class=""
            placeholder="Email">
    </div>

    <div class="mt-6">
        <input bind:this={passwordInput} type="password" class=""
            placeholder="Password">
    </div>

    <div class="mt-6 text-xl text-light">
    </div>
    <div class="mt-6">
        <button class="w-full py-5">Create account</button>
    </div>



</div>



<style>
</style>

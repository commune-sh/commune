<script>
import { login } from '$lib/matrix/requests';
import { browser } from '$app/environment';
import { onMount, tick } from 'svelte';
import { goto } from '$app/navigation';

let flows = $state(null);

async function getFlows() {
    try {
        const response = await login();
        if(response?.flows) {
            flows = response.flows;
            console.log("Login flows: ", flows)
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

function updateHash(hash) {
    if(!browser) return;
    const url = new URL(window.location.href);
    url.hash = hash;
    window.history.pushState({}, "", url);
}

onMount(() => {

    if(browser) {
        updateHash('#login');
    }

    getFlows();
})

let handle;
let password;

let {
    switchToSignup
} = $props();

let providers = $derived.by(() => {
    if(flows) {
        return flows.find(flow => flow.type === 'm.login.sso').identity_providers;
    }
    return [];
});

async function getIcon(brand) {
    try {
        const module = await import('$lib/assets/icons.js');
        return module[brand];
    } catch (error) {
        console.error('Error loading icon:', error);
        return null;
    }
}

let icons_loaded = $state(false);

$effect(() => {
    if(providers?.length > 0 && !icons_loaded) {
        providers.forEach(async(provider) => {
            const brand = provider.brand;
            provider.icon = await getIcon(brand);
        })
        icons_loaded = true;
    }
})

onMount(async () => {
    await tick();
    handle.focus();
});

function signup() {
    goto(`#signup`);
}

</script>


<div class="login-container flex flex-col w-[420px] rounded-[4px]
    bg-switcher mt-10
    p-[20px]">

    <div class="flex justify-center">
        <div class="title silk">
            Login
        </div>
    </div>

    <div class="mt-8">
        <input bind:this={handle} type="text" class=""
        placeholder="Email or username">
    </div>
    <div class="mt-6">
        <input bind:this={password} type="password" class=""
        placeholder="Password">
    </div>
    <div class="mt-6 text-xl">
        Need an account? <a onclick={signup} class="text-primary">Sign up</a>
    </div>
    <div class="mt-6">
        <button class="w-full py-5">Log in</button>
    </div>

</div>

    {#if providers?.length > 0}
    <div class="mt-16 flex justify-center">
        {#each providers as provider(provider.id)}
            <div class="provider bg-switcher p-[8px] mx-2 
                rounded-[8px] cursor-pointer">
                <div class="icon w-[24px]">
                {#if provider?.icon}
                    {@html provider.icon}
                {/if}
                </div>
            </div>
        {/each}
    </div>
    {/if}



<style>
.provider {
    border: 2px solid transparent;
}

.provider:hover {
    border: 2px solid var(--shade-8);
}

.title {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--primary);
    text-shadow: 3px 3px 3px hsla(0, 0%, 1%, 0.5);
}
</style>

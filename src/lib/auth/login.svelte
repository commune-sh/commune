<script>
import { browser } from '$app/environment';
import { onMount, tick } from 'svelte';
import { goto } from '$app/navigation';

onMount(() => {

    if(browser) {
        //updateHash('#login');
    }

})

let handle;
let password;

let {
    login_flows
} = $props();

let no_flows = $derived.by(() => {
    return !login_flows;
});

let providers = $derived.by(() => {
    if(login_flows) {
        let sso = login_flows.some(element => element.type === "m.login.sso");
        if(sso) {
            return login_flows.find(flow => flow.type === 'm.login.sso').identity_providers;
        }
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
    //goto(`#signup`);
}

</script>


<div class="login-container flex flex-col w-[420px] rounded-[4px]
    bg-switcher mt-10 relative
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
    <div class="mt-6 text-xl text-light">
        Need an account? 
        <a href="/signup" class="text-primary hover:text-text silk">Sign up</a>
    </div>
    <div class="mt-6">
        <button class="w-full py-5">Log in</button>
    </div>



</div>

    {#if no_flows}
    <div class="mt-12 flex justify-center">
        <div class="spinner border-primary"></div>
</div>
    {:else if providers?.length > 0}
    <div class="mt-12 flex justify-center">
        {#each providers as provider, i (provider.id)}
            <div class="provider bg-switcher p-[8px] mx-2 
                rounded-[8px] cursor-pointer" tabindex="0">
                <div class="brand w-[22px]">
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
    background: var(--shade-3);
}

.provider:hover {
    background: var(--shade-6);
}

.brand {
    fill: var(--icon);
}

.provider:hover .brand {
    fill: var(--text);
    opacity: 0.7;
}

.title {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--primary);
    text-shadow: 3px 3px 3px hsla(0, 0%, 1%, 0.5);
}

.loading-flows {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--shade-9);
    height: 3px;
    border-radius: 0 0 4px 4px;
}
</style>

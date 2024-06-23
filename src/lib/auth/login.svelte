<script>
import { onMount, tick } from 'svelte';
let handle;
let password;

let {
    flows
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

</script>

<div class="login-container flex flex-col w-[420px] rounded-[4px]
    bg-switcher
    p-[20px]">
    <div class="">
        Log in
    </div>
    <div class="mt-20">
        <input bind:this={handle} type="text" class=""
        placeholder="Email or username">
    </div>
    <div class="mt-6">
        <input bind:this={password} type="password" class=""
        placeholder="Password">
    </div>
    <div class="mt-6 text-xl">
        Need an account? <a href="/signup" class="text-primary">Sign up</a>
    </div>
    <div class="mt-6">
        <button class="w-full py-5">Log in</button>
    </div>

</div>

    {#if providers?.length > 0}
    <div class="mt-16 flex ">
        {#each providers as provider(provider.id)}
            <div class="bg-switcher p-[8px] mx-2 rounded-[8px]">
                <div class="icon w-[34px]">
                {#if provider?.icon}
                    {@html provider.icon}
                {/if}
                </div>
            </div>
        {/each}
    </div>
    {/if}



<style>
</style>

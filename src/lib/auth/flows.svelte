<script>
import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let login_flows = $derived(store.auth.login_flows)

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

</script>

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
</style>

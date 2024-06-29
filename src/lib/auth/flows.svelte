<script>
import { PUBLIC_HOMESERVER, PUBLIC_BASE_URL } from '$env/static/public';
import { createStore } from '$lib/store/store.svelte.js'
const store = createStore()

let {
    busy
} = $props();

let login_flows = $derived(store.matrix.login_flows)

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

function startAuth(provider) {
    let link = `${PUBLIC_HOMESERVER}/_matrix/client/v3/login/sso/redirect/${provider.id}?redirectUrl=${PUBLIC_BASE_URL}/oidc/callback`;
    window.location = link
}

</script>

{#if no_flows}

    <div class="loading-flows animate-pulse"></div>

{:else if providers?.length > 0}

    <div class="sep mt-5 h-[1px] bg-shade-3">
    </div>

    <div class="flex flex-col justify-center">
        {#each providers as provider, i (provider.id)}

            <div class="mt-5">
                <button class="flex items-center justify-center
                    font-normal
                    secondary w-full py-4
                    text-light text-xl
                    bg-shade-3 hover:bg-shade-4"
                    onclick={() => startAuth(provider)}
                    class:disabled={busy}
                    disabled={busy}>
                    <span class="brand w-[16px] h-[16px] mr-4">
                        {#if provider?.icon}
                            {@html provider.icon}
                        {/if}
                    </span>
                    Continue with {provider.name}
                </button>
            </div>

        {/each}
    </div>
{/if}




<style>
.brand {
    fill: var(--icon);
}
.disabled:hover{
    background: var(--shade-3);
}
.loading-flows {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(to right, transparent 0%, transparent 50%,
        var(--shade-10) 50%, var(--shade-10) 100%);
    background-size: 200% 100%;
    animation: loading 1.6s ease-in-out infinite;
    border-radius: 4px;
}

@keyframes loading {
    0% {
        background-position: 100% 0;
    }
    100% {
        background-position: -100% 0;
    }
}
</style>

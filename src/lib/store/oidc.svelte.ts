import type { ValidatedAuthMetadata } from 'matrix-js-sdk/src/oidc/validate'

import { getAuthMetadata, registerOauthClient } from '$lib/matrix/requests'

export let config: {
    metadata: ValidatedAuthMetadata | null;
    client_id: string | null;
} = $state({
    metadata: null,
    client_id: null
})

let metadata = $derived(config?.metadata)

let registration_endpoint = $derived(metadata?.registration_endpoint)
let authorization_endpoint = $derived(metadata?.authorization_endpoint)

$effect.root(() => {
    $effect(() => {
    })
})

async function fetchAuthMetadata() {
    try {
        const response = await getAuthMetadata()
        console.log(response)
        if(response) {
            config.metadata = response
        }
    } catch (error) {
        console.error(error)
    }
}

async function newClient() {
    if(!registration_endpoint && !authorization_endpoint) return
    try {
        const response = await registerOauthClient(registration_endpoint)

        if(response?.client_id) {
            config.client_id = response.client_id
            const res = await fetch('/api/auth/oidc', {
                method: 'POST',
                body: JSON.stringify({
                    client_id: response.client_id,
                    authorization_endpoint: authorization_endpoint
                }),
            });

            const json = await res.json();
            console.log("Cookie store response:", json)
        }
    } catch (error) {
        console.error(error)
    }
}


export function createOIDCStore() {

    async function init() {
        await fetchAuthMetadata()
        //await newClient()
    }

    return {
        get config() {
            return config;
        },

        get metadata() {
            return metadata;
        },

        init,

    }
}

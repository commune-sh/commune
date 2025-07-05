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
        if(response) {
            config.metadata = response
        }
    } catch (error) {
        console.error(error)
    }
}

export function createOIDCStore() {

    async function init() {
        await fetchAuthMetadata()
    }

    return {
        get config() {
            return config;
        },

        get metadata() {
            return metadata;
        },

        get authorization_endpoint() {
            return authorization_endpoint;
        },

        get registration_endpoint() {
            return registration_endpoint;
        },

        init,

    }
}

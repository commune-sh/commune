import { browser  } from '$app/environment'

import type { ValidatedAuthMetadata } from 'matrix-js-sdk/src/oidc/validate'

import { getAuthMetadata } from '$lib/matrix/requests'

export let config: {
    metadata: ValidatedAuthMetadata | null;
    client: null
} = $state({
    metadata: null,
    client: null
})

let metadata = $derived(config?.metadata)

if(browser && !config.metadata) {
    fetchAuthMetadata()
}

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

export function createOIDCStore() {

    return {
        get config() {
            return config;
        },

        get metadata() {
            return metadata;
        },

    }
}
